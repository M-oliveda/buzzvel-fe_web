import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://localhost:${PORT}`;

/** E2E runs against the production build, never the dev server (MASTERPLAN §11.2). */
export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
    use: {
        baseURL,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "desktop",
            use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
        },
        {
            name: "mobile",
            use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
        },
    ],
    webServer: {
        command: `npm run build && npm start -- -p ${PORT}`,
        url: `${baseURL}/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        env: {
            APP_ENV: "local",
            NEXT_PUBLIC_SITE_URL: baseURL,
            // Both projects, parallel workers and retries share one IP: keep 429 out of e2e.
            CONTACT_RATE_LIMIT_MAX: "1000",
        },
    },
});
