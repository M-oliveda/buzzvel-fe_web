// @vitest-environment node
import { clientIp, resolveCorrelationId } from "./correlation-id";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

describe("resolveCorrelationId", () => {
    it("reuses a safe incoming id", () => {
        expect(resolveCorrelationId(new Headers({ "X-Correlation-ID": "req-123_abc.9" }))).toBe(
            "req-123_abc.9",
        );
    });

    it.each([
        ["missing", undefined],
        ["empty", ""],
        ["unsafe characters", 'a"b{c}'],
        ["too long", "a".repeat(129)],
    ])("generates a UUID when the incoming id is %s", (_case, value) => {
        const headers = new Headers(value === undefined ? {} : { "X-Correlation-ID": value });

        expect(resolveCorrelationId(headers)).toMatch(UUID);
    });
});

describe("clientIp", () => {
    it("uses the first X-Forwarded-For entry", () => {
        expect(clientIp(new Headers({ "X-Forwarded-For": " 203.0.113.7 , 10.0.0.1" }))).toBe(
            "203.0.113.7",
        );
    });

    it("falls back to X-Real-IP, then to a shared bucket", () => {
        expect(clientIp(new Headers({ "X-Real-IP": "198.51.100.2" }))).toBe("198.51.100.2");
        expect(clientIp(new Headers())).toBe("unknown");
    });
});
