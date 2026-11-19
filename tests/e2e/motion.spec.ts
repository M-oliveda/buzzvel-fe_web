import { expect, test, type Page } from "@playwright/test";

const finalStats = ["24K+", "120+", "92%"];

/** Computed opacity of every Reveal wrapper on the page. */
function revealOpacities(page: Page): Promise<string[]> {
    return page
        .locator("[data-slot='reveal']")
        .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).opacity));
}

function chipAnimation(page: Page): Promise<string> {
    return page
        .getByText("4.9 avg rating")
        .locator("..")
        .evaluate((chip) => getComputedStyle(chip).animationName);
}

test.describe("motion, reduced", () => {
    test.use({ reducedMotion: "reduce" });

    test("shows every section and the final stats without scrolling", async ({ page }) => {
        await page.goto("/");

        // Server HTML starts hidden until hydration reads the preference; then nothing animates.
        await expect.poll(() => revealOpacities(page)).not.toContain("0");
        expect(new Set(await revealOpacities(page))).toEqual(new Set(["1"]));
        await expect(page.locator("dd [aria-hidden='true']")).toHaveText(finalStats);
        expect(await chipAnimation(page)).toBe("none");
    });
});

test.describe("motion, allowed", () => {
    test.use({ reducedMotion: "no-preference" });

    test("reveals sections and counts the stats up once they scroll into view", async ({
        page,
    }) => {
        await page.goto("/");
        const digits = page.locator("dd [aria-hidden='true']");

        expect(await chipAnimation(page)).toBe("float");
        // Off-screen stats are reset to zero after hydration, then counted up when seen.
        await expect(digits.first()).toHaveText("0K+");

        const reveals = page.locator("[data-slot='reveal']");
        for (const reveal of await reveals.all()) {
            await reveal.scrollIntoViewIfNeeded();
            await expect
                .poll(() => reveal.evaluate((el) => getComputedStyle(el).opacity))
                .toBe("1");
        }

        await digits.first().scrollIntoViewIfNeeded();
        await expect(digits).toHaveText(finalStats, { timeout: 5_000 });
        // The accessible copy never changes.
        await expect(page.locator("dd .sr-only")).toHaveText(finalStats);
    });
});
