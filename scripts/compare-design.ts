/**
 * Pixel-diff helper for the design pass (MASTERPLAN §10.6). Dev only, never shipped.
 *
 * Screenshots the running production build at each design frame's width (2×, like the frames),
 * then writes overlay and diff images, for the whole page and per section, to `design/diff/`.
 * Everything it reads and writes lives in the git-ignored `design/` folder: the frames and the
 * section offsets measured on them are confidential (AGENTS.md §8).
 *
 * Usage: start a production server (`npm run build && npm start -- -p 3100`), then
 * `npm run design:compare [-- desktop|mobile]`. `DESIGN_BASE_URL` overrides the server origin.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";
import pixelmatch from "pixelmatch";
import pngjs from "pngjs";

const { PNG } = pngjs;
type Png = InstanceType<typeof PNG>;

const DESIGN_DIR = path.resolve(import.meta.dirname, "../design");
const OUT_DIR = path.join(DESIGN_DIR, "diff");
const BASE_URL = process.env.DESIGN_BASE_URL ?? "http://localhost:3100";
const SCALE = 2;
// Fast compression: the full-page images are tens of megapixels and only read by a person.
const WRITE_OPTIONS = { deflateLevel: 1 };

/** Page regions in DOM order; the names key the offsets in `design/sections.json`. */
const SECTIONS = [
    "header",
    "hero",
    "categories",
    "featured-course",
    "how-it-works",
    "testimonial-stats",
    "people",
    "contact",
    "cta-band",
    "footer",
] as const;
type SectionName = (typeof SECTIONS)[number];

type FrameName = "desktop" | "mobile";

const FRAMES: Record<FrameName, { file: string; width: number }> = {
    desktop: { file: "fe-desktop.png", width: 1280 },
    mobile: { file: "fe-mobile.png", width: 402 },
};

/** Top of each section in the frame, in CSS pixels (frame pixels ÷ 2). */
type SectionOffsets = Partial<Record<FrameName, Partial<Record<SectionName, number>>>>;

type Box = { name: SectionName; y: number; height: number };

type Row = { section: string; pageHeight: number; designHeight: number; mismatch: string };

async function readPng(file: string): Promise<Png> {
    return PNG.sync.read(await readFile(file));
}

/** Copies a horizontal band of `source` into a new image of `width` × `height` (white padding). */
function crop(source: Png, y: number, height: number, width = source.width): Png {
    const target = new PNG({ width, height });
    target.data.fill(255);
    const rows = Math.max(0, Math.min(height, source.height - y));
    const cols = Math.min(width, source.width);
    for (let row = 0; row < rows; row++) {
        const from = (y + row) * source.width * 4;
        source.data.copy(target.data, row * width * 4, from, from + cols * 4);
    }
    return target;
}

/** Design and page at 50 % each: misaligned edges show up as ghosted doubles. */
function overlay(page: Png, design: Png): Png {
    const target = new PNG({ width: page.width, height: page.height });
    for (let i = 0; i < page.data.length; i++) {
        target.data[i] = ((page.data[i] ?? 0) + (design.data[i] ?? 0)) >> 1;
    }
    return target;
}

async function compare(
    name: string,
    dir: string,
    page: Png,
    design: Png,
): Promise<{ mismatch: string }> {
    const height = Math.max(page.height, design.height);
    const a = crop(page, 0, height, design.width);
    const b = crop(design, 0, height);
    const diff = new PNG({ width: b.width, height });
    // Anti-aliasing is ignored so font rendering noise does not hide real layout deltas.
    const changed = pixelmatch(a.data, b.data, diff.data, b.width, height, { threshold: 0.1 });
    await Promise.all([
        writeFile(path.join(dir, `${name}-page.png`), PNG.sync.write(a, WRITE_OPTIONS)),
        writeFile(path.join(dir, `${name}-design.png`), PNG.sync.write(b, WRITE_OPTIONS)),
        writeFile(path.join(dir, `${name}-diff.png`), PNG.sync.write(diff, WRITE_OPTIONS)),
        writeFile(
            path.join(dir, `${name}-overlay.png`),
            PNG.sync.write(overlay(a, b), WRITE_OPTIONS),
        ),
    ]);
    return { mismatch: `${((changed / (b.width * height)) * 100).toFixed(1)} %` };
}

async function screenshot(width: number): Promise<{ image: Png; boxes: Box[] }> {
    const browser = await chromium.launch();
    try {
        // Reduced motion shows every `Reveal` section and the final stat values straight away.
        const context = await browser.newContext({
            viewport: { width, height: 900 },
            deviceScaleFactor: SCALE,
            reducedMotion: "reduce",
        });
        const page = await context.newPage();
        await page.goto(BASE_URL, { waitUntil: "networkidle" });
        // Load every lazy image up front. Images hidden at this width never decode, so each wait
        // ends on load, error or a timeout instead of `img.decode()`, which can hang forever.
        await page.evaluate(async () => {
            const settled = [...document.images].map((img) => {
                img.loading = "eager";
                if (img.complete) return null;
                return new Promise((resolve) => {
                    img.addEventListener("load", resolve, { once: true });
                    img.addEventListener("error", resolve, { once: true });
                    setTimeout(resolve, 5000);
                });
            });
            await Promise.all(settled);
            await document.fonts.ready;
        });
        const boxes = await page.evaluate((names) => {
            const elements = [
                document.querySelector("body > header, header"),
                ...document.querySelectorAll("main > section"),
                document.querySelector("footer"),
            ];
            return elements.map((element, index) => {
                const rect = element?.getBoundingClientRect();
                return {
                    name: names[index],
                    y: (rect?.top ?? 0) + window.scrollY,
                    height: rect?.height ?? 0,
                };
            });
        }, SECTIONS);
        const image = PNG.sync.read(await page.screenshot({ fullPage: true }));
        return { image, boxes: boxes as Box[] };
    } finally {
        await browser.close();
    }
}

async function readOffsets(): Promise<SectionOffsets> {
    try {
        return JSON.parse(await readFile(path.join(DESIGN_DIR, "sections.json"), "utf8"));
    } catch (error) {
        console.warn(`No design/sections.json (${String(error)}): full-page diff only.`);
        return {};
    }
}

async function run(frame: FrameName, offsets: SectionOffsets): Promise<void> {
    const { file, width } = FRAMES[frame];
    const dir = path.join(OUT_DIR, frame);
    await mkdir(dir, { recursive: true });

    const design = await readPng(path.join(DESIGN_DIR, file));
    const { image, boxes } = await screenshot(width);
    const rows: Row[] = [
        {
            section: "full page",
            pageHeight: image.height / SCALE,
            designHeight: design.height / SCALE,
            ...(await compare("full", dir, image, design)),
        },
    ];

    const frameOffsets = offsets[frame] ?? {};
    for (const [index, box] of boxes.entries()) {
        const top = frameOffsets[box.name];
        if (top === undefined) continue;
        // A section ends where the next measured one starts; the last one runs to the frame's end.
        const next = boxes
            .slice(index + 1)
            .map((later) => frameOffsets[later.name])
            .find((value) => value !== undefined);
        const designHeight = (next ?? design.height / SCALE) - top;
        const pageCrop = crop(image, Math.round(box.y * SCALE), Math.round(box.height * SCALE));
        const designCrop = crop(design, Math.round(top * SCALE), Math.round(designHeight * SCALE));
        rows.push({
            section: box.name,
            pageHeight: Math.round(box.height),
            designHeight: Math.round(designHeight),
            ...(await compare(box.name, dir, pageCrop, designCrop)),
        });
    }

    console.warn(`\n${frame} (${width} px) → ${path.relative(process.cwd(), dir)}`);
    // The tables are this CLI's output: mismatch per section, then where each section sits.
    // eslint-disable-next-line no-console
    console.table(rows);
    // eslint-disable-next-line no-console
    console.table(boxes.map(({ name, y, height }) => ({ name, y: Math.round(y), height })));
}

const requested = process.argv.slice(2).filter((arg): arg is FrameName => arg in FRAMES);
const offsets = await readOffsets();
for (const frame of requested.length > 0 ? requested : (Object.keys(FRAMES) as FrameName[])) {
    await run(frame, offsets);
}
