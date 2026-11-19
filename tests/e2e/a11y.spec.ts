import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { WEBKIT_TAB_ORDER } from "./browser-notes";

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function expectNoAxeViolations(page: Page): Promise<void> {
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations.map(({ id, nodes }) => ({ id, count: nodes.length }))).toEqual([]);
}

type FocusStop = {
    name: string;
    hasOutline: boolean;
    /** Contrast of the focus outline against the surface it is drawn on (WCAG 1.4.11). */
    contrast: number;
    /** Hidden under the sticky header or below the viewport (WCAG 2.4.11). */
    obscured: boolean;
};

/** Reads the focused element after finishing its CSS transitions, so the ring is final. */
function readFocusStop(page: Page): Promise<FocusStop | null> {
    return page.evaluate(() => {
        const element = document.activeElement;
        if (!(element instanceof HTMLElement) || element === document.body) return null;
        for (const animation of element.getAnimations()) animation.finish();

        const rgb = (color: string): number[] =>
            (color.match(/[\d.]+/g) ?? []).slice(0, 4).map(Number);
        const luminance = ([r = 0, g = 0, b = 0]: number[]): number => {
            const [lr = 0, lg = 0, lb = 0] = [r, g, b].map((v) => {
                const c = v / 255;
                return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
            });
            return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
        };

        // The ring sits outside the element (outline-offset), so it is drawn on the parent surface.
        let surface = "rgb(255, 255, 255)";
        for (let node = element.parentElement; node; node = node.parentElement) {
            const color = getComputedStyle(node).backgroundColor;
            if ((rgb(color)[3] ?? 1) > 0) {
                surface = color;
                break;
            }
        }

        const style = getComputedStyle(element);
        const [a, b] = [luminance(rgb(style.outlineColor)), luminance(rgb(surface))].sort(
            (x, y) => y - x,
        );
        const rect = element.getBoundingClientRect();
        const header = document.querySelector("header")?.getBoundingClientRect();
        const pinned =
            element.closest("header") !== null || getComputedStyle(element).position === "fixed";

        return {
            name: (element.getAttribute("aria-label") ?? element.textContent ?? "")
                .trim()
                .replace(/\s+/g, " ")
                .slice(0, 40),
            hasOutline: style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0,
            contrast: Math.round((((a ?? 0) + 0.05) / ((b ?? 0) + 0.05)) * 100) / 100,
            obscured:
                !pinned &&
                ((header !== undefined && rect.top < header.bottom) ||
                    rect.bottom > window.innerHeight),
        };
    });
}

test.describe("accessibility, reduced motion", () => {
    test.use({ reducedMotion: "reduce" });

    test("the whole page has no axe violations", async ({ page }) => {
        await page.goto("/");
        await expectNoAxeViolations(page);
    });

    test("the open mobile menu has no axe violations", async ({ page, isMobile }) => {
        test.skip(!isMobile, "The menu button is hidden on desktop");
        await page.goto("/");

        await page.getByRole("button", { name: "Menu" }).click();
        await expect(page.getByRole("button", { name: "Menu" })).toHaveAttribute(
            "aria-expanded",
            "true",
        );
        await expectNoAxeViolations(page);
    });

    test("headings form one ordered outline under a single h1", async ({ page }) => {
        await page.goto("/");

        const levels = await page
            .locator("h1, h2, h3, h4, h5, h6")
            .evaluateAll((headings) => headings.map((heading) => Number(heading.tagName[1])));

        expect(levels[0]).toBe(1);
        expect(levels.filter((level) => level === 1)).toHaveLength(1);
        levels.slice(1).forEach((level, index) => {
            expect(level, `heading ${index + 2} skips a level`).toBeLessThanOrEqual(
                (levels[index] ?? 1) + 1,
            );
        });
        await expect(page.getByRole("banner")).toBeVisible();
        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByRole("contentinfo")).toBeAttached();
        await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });

    test("the skip link is the first tab stop and moves focus to the main content", async ({
        page,
        browserName,
    }) => {
        test.skip(browserName === "webkit", WEBKIT_TAB_ORDER);
        await page.goto("/");

        await page.keyboard.press("Tab");
        const skip = page.getByRole("link", { name: "Skip to main content" });
        await expect(skip).toBeFocused();
        await expect(skip).toBeVisible();

        await page.keyboard.press("Enter");
        await expect(page.getByRole("main")).toBeFocused();
    });

    test("every tab stop shows a contrasting focus ring and stays in view", async ({
        page,
        isMobile,
        browserName,
    }) => {
        test.skip(browserName === "webkit", WEBKIT_TAB_ORDER);
        await page.goto("/");
        const stops: FocusStop[] = [];

        for (let step = 0; step < 80; step += 1) {
            await page.keyboard.press("Tab");
            const stop = await readFocusStop(page);
            if (!stop || stops.some((seen, i) => i === 0 && seen.name === stop.name)) break;
            stops.push(stop);
        }

        // Desktop walks the inline nav; mobile skips it (menu closed), so it has fewer stops.
        expect(stops.length).toBeGreaterThan(isMobile ? 25 : 30);
        const failures = stops.filter(
            (stop) => !stop.hasOutline || stop.contrast < 3 || stop.obscured,
        );
        expect(failures).toEqual([]);
    });

    test("hover transitions are instant", async ({ page }) => {
        await page.goto("/");

        const card = page.getByRole("link", { name: /Product Design/ });
        expect(await card.evaluate((element) => getComputedStyle(element).transitionDuration)).toBe(
            "0s",
        );
    });
});

test.describe("accessibility, motion allowed", () => {
    test.use({ reducedMotion: "no-preference" });

    test("the fully revealed page has no axe violations", async ({ page }) => {
        await page.goto("/");

        for (const reveal of await page.locator("[data-slot='reveal']").all()) {
            await reveal.scrollIntoViewIfNeeded();
            await expect
                .poll(() => reveal.evaluate((element) => getComputedStyle(element).opacity))
                .toBe("1");
        }
        await expectNoAxeViolations(page);
    });
});
