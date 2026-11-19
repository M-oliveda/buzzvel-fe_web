export type SecurityHeader = { key: string; value: string };

export type SecurityHeaderOptions = {
    /** `next dev`: React's development build needs `eval` for its tooling. */
    isDev: boolean;
};

/**
 * Static Content-Security-Policy (MASTERPLAN §11.3). Nonces would force every page to render per
 * request, so the prerendered page keeps `'unsafe-inline'` for scripts (Next.js inlines the RSC
 * payload) and styles (framer-motion and the people collage set inline styles): a documented
 * known gap. No `upgrade-insecure-requests`: every asset is same-origin and Cloud Run is HTTPS
 * only, while the directive would break plain-HTTP localhost.
 */
export function buildContentSecurityPolicy({ isDev }: SecurityHeaderOptions): string {
    const directives: Record<string, readonly string[]> = {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
        "style-src": ["'self'", "'unsafe-inline'"],
        "img-src": ["'self'", "blob:", "data:"],
        "font-src": ["'self'"],
        // Same-origin fetches (contact API) and, in dev, the same-host HMR WebSocket.
        "connect-src": ["'self'"],
        "object-src": ["'none'"],
        "base-uri": ["'self'"],
        "form-action": ["'self'"],
        "frame-ancestors": ["'none'"],
    };

    return Object.entries(directives)
        .map(([name, sources]) => `${name} ${sources.join(" ")}`)
        .join("; ");
}

/** Headers sent with every response, from `next.config.ts`. */
export function buildSecurityHeaders(options: SecurityHeaderOptions): SecurityHeader[] {
    return [
        { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        // Legacy partner of `frame-ancestors 'none'` for browsers without CSP Level 2.
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        // Ignored over plain HTTP, so localhost is unaffected. No includeSubDomains or preload:
        // the parent domain belongs to the owner, not this project.
        { key: "Strict-Transport-Security", value: "max-age=31536000" },
        {
            // `browsing-topics` is left out: current Chromium logs a console error for it.
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        },
    ];
}
