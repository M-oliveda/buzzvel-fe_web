// @vitest-environment node
import { buildContentSecurityPolicy, buildSecurityHeaders } from "./security-headers";

function directives(policy: string): Map<string, string[]> {
    return new Map(
        policy.split("; ").map((directive) => {
            const [name = "", ...sources] = directive.split(" ");
            return [name, sources];
        }),
    );
}

describe("buildContentSecurityPolicy", () => {
    it("locks production down to same-origin resources", () => {
        const policy = directives(buildContentSecurityPolicy({ isDev: false }));

        expect(Object.fromEntries(policy)).toEqual({
            "default-src": ["'self'"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "style-src": ["'self'", "'unsafe-inline'"],
            "img-src": ["'self'", "blob:", "data:"],
            "font-src": ["'self'"],
            "connect-src": ["'self'"],
            "object-src": ["'none'"],
            "base-uri": ["'self'"],
            "form-action": ["'self'"],
            "frame-ancestors": ["'none'"],
        });
    });

    it("allows eval only in development", () => {
        expect(buildContentSecurityPolicy({ isDev: false })).not.toContain("'unsafe-eval'");
        expect(directives(buildContentSecurityPolicy({ isDev: true })).get("script-src")).toEqual([
            "'self'",
            "'unsafe-inline'",
            "'unsafe-eval'",
        ]);
    });

    it("produces a single-line header value without empty directives", () => {
        const policy = buildContentSecurityPolicy({ isDev: true });

        expect(policy).not.toMatch(/[\n\r]/);
        expect(policy.split("; ").every((directive) => directive.includes(" "))).toBe(true);
    });
});

describe("buildSecurityHeaders", () => {
    it("sends the CSP with the rest of the security headers", () => {
        const headers = Object.fromEntries(
            buildSecurityHeaders({ isDev: false }).map(({ key, value }) => [key, value]),
        );

        expect(headers).toEqual({
            "Content-Security-Policy": buildContentSecurityPolicy({ isDev: false }),
            "X-Content-Type-Options": "nosniff",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "X-Frame-Options": "DENY",
            "Cross-Origin-Opener-Policy": "same-origin",
            "Strict-Transport-Security": "max-age=31536000",
            "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
        });
    });
});
