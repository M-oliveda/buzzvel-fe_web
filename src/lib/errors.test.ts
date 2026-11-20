// @vitest-environment node
import { RateLimitError, ValidationError } from "./errors";

describe("ValidationError", () => {
    it("carries field errors and names the fields, not their values", () => {
        const error = new ValidationError({ email: ["Enter a valid email address."] });

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("ValidationError");
        expect(error.fieldErrors.email).toEqual(["Enter a valid email address."]);
        expect(error.message).toBe("Validation failed: email");
    });
});

describe("RateLimitError", () => {
    it("carries the retry delay in seconds", () => {
        const error = new RateLimitError(42);

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe("RateLimitError");
        expect(error.retryAfterSeconds).toBe(42);
    });
});
