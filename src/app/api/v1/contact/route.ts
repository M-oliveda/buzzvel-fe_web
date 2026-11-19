import { z } from "zod";

import { clientIp, CORRELATION_ID_HEADER, resolveCorrelationId } from "@/lib/correlation-id";
import { getEnv } from "@/lib/env";
import { RateLimitError, ValidationError } from "@/lib/errors";
import { getRequestLogger } from "@/lib/logger";
import { createRateLimiter, type RateLimiter } from "@/lib/rate-limit";
import {
    CONTACT_MAX_BODY_BYTES,
    contactSchema,
    type ContactResponseBody,
} from "@/schemas/contact.schema";

/** A request rejected before validation; mapped straight to a status and error code. */
class RequestError extends Error {
    constructor(
        readonly status: 400 | 413 | 415,
        readonly code: "invalid_json" | "payload_too_large" | "unsupported_media_type",
    ) {
        super(code);
        this.name = "RequestError";
    }
}

let limiter: RateLimiter | undefined;

function getLimiter(): RateLimiter {
    const { CONTACT_RATE_LIMIT_MAX, CONTACT_RATE_LIMIT_WINDOW_MS } = getEnv();
    limiter ??= createRateLimiter({
        max: CONTACT_RATE_LIMIT_MAX,
        windowMs: CONTACT_RATE_LIMIT_WINDOW_MS,
    });
    return limiter;
}

async function readJson(request: Request): Promise<unknown> {
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
        throw new RequestError(415, "unsupported_media_type");
    }

    const text = await request.text();
    if (new TextEncoder().encode(text).byteLength > CONTACT_MAX_BODY_BYTES) {
        throw new RequestError(413, "payload_too_large");
    }

    try {
        return JSON.parse(text);
    } catch {
        throw new RequestError(400, "invalid_json");
    }
}

/** Length of a submitted string field, for logs: never the value itself (MASTERPLAN §11.3). */
function length(body: unknown, key: string): number | undefined {
    if (typeof body !== "object" || body === null) return undefined;
    const value: unknown = Reflect.get(body, key);
    return typeof value === "string" ? value.length : undefined;
}

/**
 * Mock contact endpoint (MASTERPLAN §2): validates with the form's Zod schema, rate-limits per
 * client IP and acknowledges. It sends no email and stores nothing.
 */
export async function POST(request: Request): Promise<Response> {
    const correlationId = resolveCorrelationId(request.headers);
    const log = getRequestLogger(correlationId);
    const headers = { "Cache-Control": "no-store", [CORRELATION_ID_HEADER]: correlationId };
    const respond = (status: number, body: ContactResponseBody, extra = {}): Response =>
        Response.json(body, { status, headers: { ...headers, ...extra } });

    let body: unknown;
    try {
        body = await readJson(request);

        const quota = getLimiter().consume(clientIp(request.headers));
        if (!quota.allowed) throw new RateLimitError(Math.ceil(quota.retryAfterMs / 1000));

        const result = contactSchema.safeParse(body);
        if (!result.success) throw new ValidationError(z.flattenError(result.error).fieldErrors);

        const id = crypto.randomUUID();
        const lengths = {
            name: result.data.name.length,
            email: result.data.email.length,
            message: result.data.message.length,
        };

        // Bots that fill the hidden field get the same answer as people, so they learn nothing.
        if (result.data.website) {
            log.warn("contact honeypot triggered", { outcome: "honeypot", status: 201, id });
        } else {
            log.info("contact message received", { outcome: "received", status: 201, id, lengths });
        }
        return respond(201, { status: "received", id });
    } catch (error) {
        if (error instanceof RequestError) {
            log.info("contact request rejected", { outcome: error.code, status: error.status });
            return respond(error.status, { error: error.code });
        }
        if (error instanceof RateLimitError) {
            log.warn("contact rate limit exceeded", { outcome: "rate_limited", status: 429 });
            return respond(
                429,
                { error: "rate_limited" },
                { "Retry-After": String(error.retryAfterSeconds) },
            );
        }
        if (error instanceof ValidationError) {
            log.info("contact validation failed", {
                outcome: "validation",
                status: 400,
                fields: Object.keys(error.fieldErrors),
                lengths: {
                    name: length(body, "name"),
                    email: length(body, "email"),
                    message: length(body, "message"),
                },
            });
            return respond(400, { error: "validation", fieldErrors: error.fieldErrors });
        }

        log.error("contact request failed", {
            outcome: "internal",
            status: 500,
            error: error instanceof Error ? error.name : "unknown",
        });
        return respond(500, { error: "internal" });
    }
}
