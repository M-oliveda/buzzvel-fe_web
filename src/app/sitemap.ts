import type { MetadataRoute } from "next";

import { getEnv } from "@/lib/env";

/** `sitemap.xml` (MASTERPLAN §10.7): the single landing page at its canonical origin. */
export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: new URL("/", getEnv().NEXT_PUBLIC_SITE_URL).toString(),
            changeFrequency: "monthly",
            priority: 1,
        },
    ];
}
