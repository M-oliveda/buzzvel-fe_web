// @vitest-environment node
import { EnvValidationError, getEnv, parseEnv } from "./env";

const valid = {
    APP_ENV: "local",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
};

describe("parseEnv", () => {
    it("applies defaults for optional values", () => {
        expect(parseEnv(valid)).toEqual({
            APP_ENV: "local",
            NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
            PORT: 3000,
            LOG_LEVEL: "info",
            CONTACT_RATE_LIMIT_MAX: 5,
            CONTACT_RATE_LIMIT_WINDOW_MS: 600_000,
        });
    });

    it("coerces numeric strings", () => {
        const env = parseEnv({ ...valid, PORT: "8080", CONTACT_RATE_LIMIT_MAX: "10" });

        expect(env.PORT).toBe(8080);
        expect(env.CONTACT_RATE_LIMIT_MAX).toBe(10);
    });

    it("treats empty strings as unset", () => {
        expect(parseEnv({ ...valid, LOG_LEVEL: "" }).LOG_LEVEL).toBe("info");
    });

    it("throws a typed error naming every invalid key", () => {
        const parse = () =>
            parseEnv({ APP_ENV: "qa", NEXT_PUBLIC_SITE_URL: "not-a-url", PORT: "-1" });

        expect(parse).toThrow(EnvValidationError);
        try {
            parse();
        } catch (error) {
            expect((error as EnvValidationError).keys).toEqual([
                "APP_ENV",
                "NEXT_PUBLIC_SITE_URL",
                "PORT",
            ]);
        }
    });

    it("never includes values in the error message", () => {
        expect(() => parseEnv({ ...valid, APP_ENV: "super-secret-value" })).toThrow(
            /^Invalid or missing environment variables: APP_ENV$/,
        );
    });

    it("reports missing required keys", () => {
        expect(() => parseEnv({})).toThrow(/APP_ENV, NEXT_PUBLIC_SITE_URL/);
    });
});

describe("getEnv", () => {
    it("parses process.env once and caches the result", () => {
        vi.stubEnv("APP_ENV", "develop");
        vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");

        const first = getEnv();
        vi.stubEnv("APP_ENV", "production");

        expect(first.APP_ENV).toBe("develop");
        expect(getEnv()).toBe(first);
        vi.unstubAllEnvs();
    });
});
