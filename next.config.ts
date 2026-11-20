import type { NextConfig } from "next";

import { buildSecurityHeaders } from "./src/lib/security-headers";

// CSP and security headers (MASTERPLAN §11.3); `next dev` additionally allows eval.
const securityHeaders = buildSecurityHeaders({ isDev: process.env.NODE_ENV === "development" });

const nextConfig: NextConfig = {
    // Self-contained server.js for the Docker `app` target.
    output: "standalone",
    poweredByHeader: false,
    cacheComponents: true,
    images: {
        // AVIF first, WebP fallback (MASTERPLAN §10.7). `qualities` is required since Next.js 16.
        formats: ["image/avif", "image/webp"],
        qualities: [75],
    },
    partialPrefetching: true,
    turbopack: {
        rules: {
            "*.css": {
                loaders: ["@tailwindcss/turbopack"],
                as: "*.css",
            },
        },
    },
    async headers() {
        return [{ source: "/:path*", headers: securityHeaders }];
    },
};

export default nextConfig;
