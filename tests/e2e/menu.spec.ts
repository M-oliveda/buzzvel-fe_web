import { expect, test } from "@playwright/test";

import { WEBKIT_TAB_ORDER } from "./browser-notes";

// The menu only exists below `lg`; the desktop project covers the inline nav in smoke.spec.ts.
test.describe("mobile menu (keyboard only)", () => {
    test.beforeEach(({ isMobile }) => {
        test.skip(!isMobile, "The menu button is hidden on desktop");
    });

    test("opens, traps focus, locks scroll and closes on Escape", async ({ page }) => {
        await page.goto("/");
        const button = page.getByRole("button", { name: "Menu" });
        const nav = page.getByRole("navigation", { name: "Main" });

        await button.focus();
        await page.keyboard.press("Enter");

        await expect(button).toHaveAttribute("aria-expanded", "true");
        await expect(nav.getByRole("link", { name: "Courses" })).toBeFocused();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

        // 4 nav links + 2 actions, then focus wraps to the menu button instead of leaving.
        for (let step = 0; step < 6; step += 1) await page.keyboard.press("Tab");
        await expect(button).toBeFocused();

        await page.keyboard.press("Escape");
        await expect(button).toHaveAttribute("aria-expanded", "false");
        await expect(button).toBeFocused();
        expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    });

    test("choosing a link with Enter closes the menu and jumps to the section", async ({
        page,
        browserName,
    }) => {
        // The focus trap handles Tab at the edges only; inside the menu the browser moves focus.
        test.skip(browserName === "webkit", WEBKIT_TAB_ORDER);
        await page.goto("/");
        const button = page.getByRole("button", { name: "Menu" });

        await button.focus();
        await page.keyboard.press("Enter");
        await page.keyboard.press("Tab"); // Courses → For Teams
        await page.keyboard.press("Enter");

        await expect(button).toHaveAttribute("aria-expanded", "false");
        await expect(page).toHaveURL(/#contact$/);
    });
});
