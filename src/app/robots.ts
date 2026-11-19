import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { getEnv } from "@/lib/env";

/**
 * `robots.txt` (MASTERPLAN §10.7). Only production may be indexed; every other environment
 * disallows everything, on top of the NGINX gate's `X-Robots-Tag: noindex`. `connection()` makes
 * it read `APP_ENV` per request, so an image built with the wrong build argument still cannot
 * open a preview, develop or staging deployment to crawlers.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
    await connection();
    const { APP_ENV, NEXT_PUBLIC_SITE_URL } = getEnv();

    if (APP_ENV !== "production") {
        return { rules: { userAgent: "*", disallow: "/" } };
    }

    return {
        rules: { userAgent: "*", allow: "/", disallow: "/api/" },
        sitemap: new URL("/sitemap.xml", NEXT_PUBLIC_SITE_URL).toString(),
    };
}
