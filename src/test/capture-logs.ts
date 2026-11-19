import { getLogger } from "@/lib/logger";

const MESSAGE = Symbol.for("message");

/** Captures the formatted lines the Console transport would print, parsed back from JSON. */
export function captureLogs(): { lines: () => Record<string, unknown>[] } {
    const [transport] = getLogger().transports;
    if (!transport) throw new Error("Logger has no transport");

    const lines: Record<string, unknown>[] = [];
    vi.spyOn(transport, "log").mockImplementation((info: Record<symbol, unknown>, next) => {
        lines.push(JSON.parse(String(info[MESSAGE])) as Record<string, unknown>);
        next();
    });
    return { lines: () => lines };
}
