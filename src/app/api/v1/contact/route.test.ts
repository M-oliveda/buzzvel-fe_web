// @vitest-environment node
import { contact } from "@/content/home";
import { captureLogs } from "@/test/capture-logs";

import { POST } from "./route";

vi.mock("@/lib/env", () => ({
    getEnv: () => ({
        APP_ENV: "local",
        LOG_LEVEL: "info",
        CONTACT_RATE_LIMIT_MAX: 2,
        CONTACT_RATE_LIMIT_WINDOW_MS: 60_000,
    }),
}));

const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Which course should I start with?",
};

let ipCounter = 0;

/** Each request gets its own client IP unless one is given, so rate-limit state never leaks. */
function contactRequest(
    body: unknown,
    { ip, headers = {} }: { ip?: string; headers?: Record<string, string> } = {},
): Request {
    ipCounter += 1;
    return new Request("http://localhost/api/v1/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": ip ?? `203.0.113.${ipCounter}`,
            ...headers,
        },
        body: typeof body === "string" ? body : JSON.stringify(body),
    });
}

describe("POST /api/v1/contact", () => {
    // Swallow log lines so test output stays readable; tests that assert on logs capture again.
    beforeEach(() => {
        captureLogs();
    });

    it("acknowledges a valid message with 201 and an id", async () => {
        const response = await POST(contactRequest(valid));

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ status: "received", id: expect.any(String) });
        expect(response.headers.get("Cache-Control")).toBe("no-store");
    });

    it("echoes a safe X-Correlation-ID and replaces an unsafe one", async () => {
        const echoed = await POST(
            contactRequest(valid, { headers: { "X-Correlation-ID": "abc-1" } }),
        );
        const replaced = await POST(
            contactRequest(valid, { headers: { "X-Correlation-ID": "bad id\n" } }),
        );

        expect(echoed.headers.get("X-Correlation-ID")).toBe("abc-1");
        expect(replaced.headers.get("X-Correlation-ID")).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("returns 400 with field errors from the shared schema", async () => {
        const response = await POST(contactRequest({ ...valid, email: "nope", message: "hi" }));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({
            error: "validation",
            fieldErrors: {
                email: [contact.form.errors.emailInvalid],
                message: [contact.form.errors.messageTooShort],
            },
        });
    });

    it("returns 400 for a body that is not JSON", async () => {
        const response = await POST(contactRequest("{not json"));

        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: "invalid_json" });
    });

    it("returns 415 for anything but JSON, such as a native form post", async () => {
        const response = await POST(
            contactRequest("name=Ada", {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }),
        );

        expect(response.status).toBe(415);
        expect(await response.json()).toEqual({ error: "unsupported_media_type" });
    });

    it("returns 413 for a body over 16 KB", async () => {
        const response = await POST(contactRequest({ ...valid, message: "x".repeat(17_000) }));

        expect(response.status).toBe(413);
        expect(await response.json()).toEqual({ error: "payload_too_large" });
    });

    it("returns 429 with Retry-After once an IP exceeds the limit", async () => {
        const ip = "198.51.100.9";
        await POST(contactRequest(valid, { ip }));
        await POST(contactRequest(valid, { ip }));

        const response = await POST(contactRequest(valid, { ip }));

        expect(response.status).toBe(429);
        expect(await response.json()).toEqual({ error: "rate_limited" });
        expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
        expect(Number(response.headers.get("Retry-After"))).toBeLessThanOrEqual(60);
    });

    it("answers a filled honeypot like a real message but logs it as a bot", async () => {
        const logs = captureLogs();

        const response = await POST(contactRequest({ ...valid, website: "spam.example" }));

        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({ status: "received", id: expect.any(String) });
        expect(logs.lines()).toEqual([expect.objectContaining({ outcome: "honeypot" })]);
    });

    it("logs ids, statuses and lengths but never the submitted text", async () => {
        const logs = captureLogs();

        await POST(contactRequest(valid, { headers: { "X-Correlation-ID": "trace-7" } }));
        await POST(contactRequest({ ...valid, name: "A" }));

        const [received, rejected] = logs.lines();
        expect(received).toEqual(
            expect.objectContaining({
                correlationId: "trace-7",
                outcome: "received",
                status: 201,
                lengths: { name: 12, email: 15, message: 33 },
            }),
        );
        expect(rejected).toEqual(
            expect.objectContaining({ outcome: "validation", status: 400, fields: ["name"] }),
        );

        const serialized = JSON.stringify(logs.lines());
        for (const value of [valid.name, valid.email, valid.message]) {
            expect(serialized).not.toContain(value);
        }
    });

    it("returns 500 without details when something unexpected fails", async () => {
        const logs = captureLogs();
        const request = contactRequest(valid);
        vi.spyOn(request, "text").mockRejectedValue(new TypeError("stream broke"));

        const response = await POST(request);

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: "internal" });
        expect(logs.lines()).toEqual([
            expect.objectContaining({ outcome: "internal", error: "TypeError" }),
        ]);
    });
});
