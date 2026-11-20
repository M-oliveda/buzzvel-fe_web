// @vitest-environment node
import { GET as health } from "./health/route";
import { GET as ready } from "./ready/route";

// `connection()` needs a live Next.js request scope; outside one it is a no-op for these probes.
vi.mock("next/server", () => ({ connection: vi.fn(async () => undefined) }));

describe.each([
    ["/health", health],
    ["/ready", ready],
])("GET %s", (_path, handler) => {
    it("returns 200 with an ok status", async () => {
        const response = await handler();

        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ status: "ok" });
    });

    it("is never cached", async () => {
        const response = await handler();

        expect(response.headers.get("Cache-Control")).toBe("no-store");
        expect(response.headers.get("Content-Type")).toContain("application/json");
    });
});
