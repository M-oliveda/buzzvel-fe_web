// @vitest-environment node
import type { AppEnv } from "@/lib/env";

import robots from "./robots";
import sitemap from "./sitemap";

// `connection()` needs a live Next.js request scope; outside one it is a no-op here.
vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));

const env = vi.hoisted(() => ({
    APP_ENV: "production" as AppEnv,
    NEXT_PUBLIC_SITE_URL: "https://buzzvel-fe.moliveda.dev",
}));
vi.mock("@/lib/env", () => ({ getEnv: () => env }));

describe("robots.txt", () => {
    afterEach(() => {
        env.APP_ENV = "production";
    });

    it("lets production be crawled, except the API, and points at the sitemap", async () => {
        expect(await robots()).toEqual({
            rules: { userAgent: "*", allow: "/", disallow: "/api/" },
            sitemap: "https://buzzvel-fe.moliveda.dev/sitemap.xml",
        });
    });

    it.each(["local", "preview", "develop", "staging"] as const)(
        "blocks every crawler in %s",
        async (appEnv) => {
            env.APP_ENV = appEnv;

            expect(await robots()).toEqual({ rules: { userAgent: "*", disallow: "/" } });
        },
    );
});

describe("sitemap.xml", () => {
    it("lists the landing page at its canonical origin", () => {
        expect(sitemap()).toEqual([
            {
                url: "https://buzzvel-fe.moliveda.dev/",
                changeFrequency: "monthly",
                priority: 1,
            },
        ]);
    });
});
