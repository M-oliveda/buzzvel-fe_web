import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// Reduced motion: the section is fully revealed, so axe measures real colours, not a fade.
test.use({ reducedMotion: "reduce" });

async function openContact(page: Page): Promise<void> {
    await page.goto("/#contact");
    await expect(page.getByRole("form", { name: "Contact us" })).toBeVisible();
}

async function expectNoAxeViolations(page: Page): Promise<void> {
    const results = await new AxeBuilder({ page })
        .include("#contact")
        .withTags(WCAG_TAGS)
        .analyze();
    expect(results.violations).toEqual([]);
}

test.describe("contact form", () => {
    test("sends a message using only the keyboard", async ({ page }) => {
        await openContact(page);

        await page.getByLabel("Full name").focus();
        await page.keyboard.type("Ada Lovelace");
        await page.keyboard.press("Tab");
        await page.keyboard.type("ada@example.com");
        await page.keyboard.press("Tab");
        await page.keyboard.type("Which course should I start with?");
        // The honeypot is skipped (tabindex -1): the next stop is the submit button.
        await page.keyboard.press("Tab");
        await expect(page.getByRole("button", { name: "Send message" })).toBeFocused();
        await page.keyboard.press("Enter");

        await expect(
            page.getByRole("form", { name: "Contact us" }).getByRole("status"),
        ).toContainText("Your message was sent");
        await expect(page.getByLabel("Full name")).toHaveValue("");
        await expectNoAxeViolations(page);
    });

    test("an empty submit shows every error and focuses the first field", async ({ page }) => {
        await openContact(page);

        await page.getByRole("button", { name: "Send message" }).click();

        await expect(page.getByLabel("Full name")).toBeFocused();
        await expect(page.getByLabel("Full name")).toHaveAttribute("aria-invalid", "true");
        await expect(page.getByLabel("Email")).toHaveAccessibleDescription(/valid email address/);
        await expect(page.getByLabel("Your question")).toHaveAttribute("aria-invalid", "true");
        await expectNoAxeViolations(page);
    });

    test("a server failure shows an alert and keeps what was typed", async ({ page }) => {
        await page.route("**/api/v1/contact", (route) =>
            route.fulfill({ status: 500, json: { error: "internal" } }),
        );
        await openContact(page);

        await page.getByLabel("Full name").fill("Ada Lovelace");
        await page.getByLabel("Email").fill("ada@example.com");
        await page.getByLabel("Your question").fill("Which course should I start with?");
        await page.getByRole("button", { name: "Send message" }).click();

        // Scoped to the form: Next.js adds its own route announcer with role="alert".
        await expect(
            page.getByRole("form", { name: "Contact us" }).getByRole("alert"),
        ).toContainText("Something went wrong");
        await expect(page.getByLabel("Full name")).toHaveValue("Ada Lovelace");
        await expectNoAxeViolations(page);
    });

    test("the API rejects anything but JSON and echoes a correlation id", async ({ request }) => {
        const response = await request.post("/api/v1/contact", {
            form: { name: "Ada" },
            headers: { "X-Correlation-ID": "e2e-check" },
        });

        expect(response.status()).toBe(415);
        expect(response.headers()["x-correlation-id"]).toBe("e2e-check");
    });
});
