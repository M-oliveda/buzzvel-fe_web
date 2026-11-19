import type { ContactFieldErrors } from "@/schemas/contact.schema";

/** Request input failed schema validation. Carries messages per field, never the input itself. */
export class ValidationError extends Error {
    readonly fieldErrors: ContactFieldErrors;

    constructor(fieldErrors: ContactFieldErrors) {
        super(`Validation failed: ${Object.keys(fieldErrors).join(", ")}`);
        this.name = "ValidationError";
        this.fieldErrors = fieldErrors;
    }
}

/** A client exceeded its request allowance; `retryAfterSeconds` feeds the `Retry-After` header. */
export class RateLimitError extends Error {
    readonly retryAfterSeconds: number;

    constructor(retryAfterSeconds: number) {
        super(`Rate limit exceeded, retry after ${retryAfterSeconds}s`);
        this.name = "RateLimitError";
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
