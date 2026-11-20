import { z } from "zod";

/** Deployment environments (MASTERPLAN §9). */
export const APP_ENVS = ["local", "preview", "develop", "staging", "production"] as const;
export type AppEnv = (typeof APP_ENVS)[number];

const LOG_LEVELS = ["error", "warn", "info", "http", "verbose", "debug", "silly"] as const;

/** Server-side environment schema (MASTERPLAN Appendix A). */
export const envSchema = z.object({
    APP_ENV: z.enum(APP_ENVS),
    NEXT_PUBLIC_SITE_URL: z.url(),
    PORT: z.coerce.number().int().positive().default(3000),
    LOG_LEVEL: z.enum(LOG_LEVELS).default("info"),
    CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
    CONTACT_RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(600_000),
});

export type Env = z.infer<typeof envSchema>;

/** Thrown when the environment does not satisfy {@link envSchema}. Lists keys only, never values. */
export class EnvValidationError extends Error {
    readonly keys: readonly string[];

    constructor(keys: readonly string[]) {
        super(`Invalid or missing environment variables: ${keys.join(", ")}`);
        this.name = "EnvValidationError";
        this.keys = keys;
    }
}

/** Parses an environment source. Empty strings count as unset so `.env` placeholders fall back to defaults. */
export function parseEnv(source: Record<string, string | undefined>): Env {
    const cleaned = Object.fromEntries(
        Object.entries(source).filter(([, value]) => value !== undefined && value !== ""),
    );
    const result = envSchema.safeParse(cleaned);

    if (!result.success) {
        const keys = [...new Set(result.error.issues.map((issue) => issue.path.join(".")))];
        throw new EnvValidationError(keys);
    }

    return result.data;
}

let cached: Env | undefined;

/** Validated server environment, parsed once on first access. The only sanctioned way to read env vars. */
export function getEnv(): Env {
    cached ??= parseEnv(process.env);
    return cached;
}
