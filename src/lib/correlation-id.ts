export const CORRELATION_ID_HEADER = "X-Correlation-ID";

// Short, log-safe ids only: anything else (newlines, JSON, very long values) is replaced.
const SAFE_ID = /^[A-Za-z0-9._-]{1,128}$/;

/** Reuses the caller's `X-Correlation-ID` when it is safe to log, otherwise generates one. */
export function resolveCorrelationId(headers: Headers): string {
    const incoming = headers.get(CORRELATION_ID_HEADER);
    return incoming && SAFE_ID.test(incoming) ? incoming : crypto.randomUUID();
}

/**
 * Client IP used as the rate-limit key: the first `X-Forwarded-For` entry (Cloud Run and the
 * NGINX gate both set the header). Clients can spoof it; acceptable for a mock endpoint and
 * documented in the README Known gaps (owner decision, Phase 4).
 */
export function clientIp(headers: Headers): string {
    const forwarded = headers.get("X-Forwarded-For")?.split(",")[0]?.trim();
    return forwarded || headers.get("X-Real-IP") || "unknown";
}
