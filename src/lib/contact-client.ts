import { CORRELATION_ID_HEADER } from "@/lib/correlation-id";
import type {
    ContactFieldErrors,
    ContactInput,
    ContactResponseBody,
} from "@/schemas/contact.schema";

export const CONTACT_ENDPOINT = "/api/v1/contact";

export type ContactSubmitResult =
    | { kind: "ok"; id: string }
    | { kind: "validation"; fieldErrors: ContactFieldErrors }
    | { kind: "rate_limited" }
    | { kind: "server" }
    | { kind: "network" };

async function readBody(response: Response): Promise<ContactResponseBody | undefined> {
    try {
        // The route only ever answers with `ContactResponseBody` (see route.ts).
        return (await response.json()) as ContactResponseBody;
    } catch {
        return undefined;
    }
}

/**
 * Sends the contact form to the mock API and maps every outcome to a result the form can render.
 * Never throws: network failures and unexpected responses become `network` / `server`.
 */
export async function submitContact(values: ContactInput): Promise<ContactSubmitResult> {
    let response: Response;
    try {
        response = await fetch(CONTACT_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [CORRELATION_ID_HEADER]: crypto.randomUUID(),
            },
            body: JSON.stringify(values),
        });
    } catch {
        return { kind: "network" };
    }

    if (response.status === 429) return { kind: "rate_limited" };

    const body = await readBody(response);
    if (response.status === 201 && body && "status" in body) return { kind: "ok", id: body.id };
    if (response.status === 400 && body && "fieldErrors" in body) {
        return { kind: "validation", fieldErrors: body.fieldErrors };
    }

    return { kind: "server" };
}
