// @vitest-environment node
import { captureLogs } from "@/test/capture-logs";

import { getLogger, getRequestLogger } from "./logger";

vi.mock("./env", () => ({
    getEnv: () => ({ APP_ENV: "staging", LOG_LEVEL: "info" }),
}));

describe("logger", () => {
    it("returns one shared logger", () => {
        expect(getLogger()).toBe(getLogger());
    });

    it("writes JSON with service, env, level, timestamp and the correlation id", () => {
        const output = captureLogs();

        getRequestLogger("req-1").info("hello", { status: 201 });

        expect(output.lines()).toEqual([
            expect.objectContaining({
                message: "hello",
                level: "info",
                service: "buzzvel-fe",
                env: "staging",
                correlationId: "req-1",
                status: 201,
                timestamp: expect.any(String),
            }),
        ]);
    });

    it("drops entries below the configured level", () => {
        const output = captureLogs();

        getLogger().debug("noise");

        expect(output.lines()).toEqual([]);
    });
});
