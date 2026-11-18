import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
    test("home page renders its main heading", async ({ page }) => {
        const response = await page.goto("/");

        expect(response?.status()).toBe(200);
        await expect(page.getByRole("main")).toBeVisible();
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
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
