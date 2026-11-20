import { healthResponse } from "@/lib/health";

/** Liveness probe: no dependencies, exempt from basic auth at the NGINX gate. */
export function GET(): Promise<Response> {
    return healthResponse();
}
