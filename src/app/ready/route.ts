import { healthResponse } from "@/lib/health";

/** Readiness probe: trivial while there are no downstream dependencies; kept for contract consistency. */
export function GET(): Promise<Response> {
    return healthResponse();
}
