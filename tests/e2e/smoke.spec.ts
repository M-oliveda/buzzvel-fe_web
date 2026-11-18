import { expect, test } from "@playwright/test";

const sectionHeadings = [
    "Learn something worth knowing.",
    "Designing products people understand.",
    "Less browsing. More learning.",
    "Meet international students & teachers",
    "Get in touch",
    "What will you learn next?",
];

test.describe("smoke", () => {
    test("home page renders the hero headline and every section", async ({ page }) => {
        const response = await page.goto("/");

        expect(response?.status()).toBe(200);
        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            "Build skills that actually move you forward.",
        );
        for (const name of sectionHeadings) {
            await expect(page.getByRole("heading", { level: 2, name })).toBeAttached();
        }
        await expect(page.getByRole("banner")).toBeVisible();
        await expect(page.getByRole("contentinfo")).toBeAttached();
    });

    test("page never scrolls horizontally", async ({ page }) => {
        await page.goto("/");

        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBe(0);
    });

    test("navigation matches the viewport", async ({ page, isMobile }) => {
        await page.goto("/");

        const menuButton = page.getByRole("button", { name: "Menu" });
        if (isMobile) {
            await expect(menuButton).toBeVisible();
            await menuButton.click();
            await expect(menuButton).toHaveAttribute("aria-expanded", "true");
            await page
                .getByRole("navigation", { name: "Main" })
                .getByRole("link", { name: "About" })
                .click();
            await expect(menuButton).toHaveAttribute("aria-expanded", "false");
            await expect(page).toHaveURL(/#how-it-works$/);
        } else {
            await expect(menuButton).toBeHidden();
            await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
        }
    });

    test("health probe responds without caching", async ({ request }) => {
        const response = await request.get("/health");

        expect(response.status()).toBe(200);
        expect(await response.json()).toEqual({ status: "ok" });
        expect(response.headers()["cache-control"]).toBe("no-store");
    });

    test("security headers are set", async ({ request }) => {
        const response = await request.get("/");
        const headers = response.headers();

        expect(headers["x-content-type-options"]).toBe("nosniff");
        expect(headers["x-powered-by"]).toBeUndefined();
    });
});
