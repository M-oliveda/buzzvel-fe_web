// @vitest-environment node
import { existsSync } from "node:fs";
import { join } from "node:path";

import { categories } from "./categories";
import { footer } from "./footer-links";
import { contact, cta, featuredCourse, hero, people, testimonial } from "./home";
import { sectionIds, site } from "./site";
import { stats } from "./stats";
import { steps } from "./steps";

const publicDir = join(process.cwd(), "public");
const anchors = new Set(["#", ...Object.values(sectionIds).map((id) => `#${id}`)]);

const allLinks = [
    ...site.nav.links,
    site.actions.login,
    site.actions.primary,
    ...footer.columns.flatMap((column) => column.links),
    ...categories.items.map((item) => ({ label: item.title, href: item.href })),
    hero.primary,
    hero.secondary,
    featuredCourse.primary,
    featuredCourse.secondary,
    people.cta,
    cta.primary,
    cta.secondary,
];

const allImages = [
    hero.image,
    ...hero.trust.avatars,
    featuredCourse.image,
    testimonial.avatar,
    ...people.columns.flatMap((column) => column.images),
    ...cta.avatars,
];

describe("content", () => {
    it("points every in-page link at a section that exists", () => {
        for (const link of allLinks) {
            expect(anchors, `${link.label} → ${link.href}`).toContain(link.href);
        }
    });

    it("numbers categories 01–04 and steps 01–03 (MASTERPLAN §10.3)", () => {
        expect(categories.items.map((item) => item.number)).toEqual(["01", "02", "03", "04"]);
        expect(steps.items.map((item) => item.label)).toEqual(["Step 01", "Step 02", "Step 03"]);
    });

    it("has three stats with non-empty values", () => {
        expect(stats).toHaveLength(3);
        for (const stat of stats) expect(stat.value).not.toBe("");
    });

    it("references only images that exist under public/", () => {
        const sources = [
            ...allImages.map((image) => image.src),
            ...contact.channels.map((channel) => channel.icon.src),
            site.logo.src,
            site.logo.srcOnDark,
        ];
        for (const src of sources) {
            expect(existsSync(join(publicDir, src)), src).toBe(true);
        }
    });

    it("describes every content photo that is not decorative", () => {
        const described = [
            hero.image,
            featuredCourse.image,
            ...people.columns.flatMap((c) => c.images),
        ];
        for (const image of described) expect(image.alt.length, image.src).toBeGreaterThan(10);
    });

    it("keeps the contact form in English (MASTERPLAN §10.3)", () => {
        expect(Object.values(contact.form.fields).map((field) => field.label)).toEqual([
            "Full name",
            "Email",
            "Your question",
        ]);
        expect(contact.form.submit).toBe("Send message");
    });
});
