import { connection } from "next/server";

export type HealthStatus = { status: "ok" };

/**
 * Builds a probe response. `connection()` opts the handler out of build-time prerendering
 * (Cache Components), so the probe always reflects the running instance.
 */
export async function healthResponse(): Promise<Response> {
    await connection();
    const body: HealthStatus = { status: "ok" };

    return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
