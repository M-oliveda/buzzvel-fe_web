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
        for (const path of ["/", "/health", "/api/v1/contact"]) {
            const headers = (await request.get(path)).headers();
            const csp = headers["content-security-policy"] ?? "";

            expect(csp).toContain("default-src 'self'");
            expect(csp).toContain("object-src 'none'");
            expect(csp).toContain("frame-ancestors 'none'");
            // Production build: eval is only allowed under `next dev`.
            expect(csp).not.toContain("'unsafe-eval'");
            expect(headers["x-content-type-options"]).toBe("nosniff");
            expect(headers["cross-origin-opener-policy"]).toBe("same-origin");
            expect(headers["strict-transport-security"]).toBe("max-age=31536000");
            expect(headers["x-powered-by"]).toBeUndefined();
        }
    });

    test("the page and the contact form run without CSP violations", async ({ page }) => {
        const violations: string[] = [];
        page.on("console", (message) => {
            if (message.type() === "error" && /content security policy/i.test(message.text())) {
                violations.push(message.text());
            }
        });
        await page.addInitScript(() => {
            document.addEventListener("securitypolicyviolation", (event) => {
                console.error(
                    `Content Security Policy: ${event.violatedDirective} ${event.blockedURI}`,
                );
            });
        });

        await page.goto("/");
        await page.keyboard.press("End");
        await page.getByLabel("Full name").fill("Ada Lovelace");
        await page.getByLabel("Email").fill("ada@example.com");
        await page.getByLabel("Your question").fill("Which course should I start with?");
        await page.getByRole("button", { name: "Send message" }).click();
        await expect(
            page.getByRole("form", { name: "Contact us" }).getByRole("status"),
        ).toContainText("Your message was sent");

        expect(violations).toEqual([]);
    });
});
