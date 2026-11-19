import { http, HttpResponse } from "msw";

import { server, setupMswServer } from "@/test/msw";

import { submitContact } from "./contact-client";

const ENDPOINT = "*/api/v1/contact";
const values = { name: "Ada", email: "ada@example.com", message: "Which course first?" };

setupMswServer();

describe("submitContact", () => {
    it("posts the values as JSON with a correlation id and returns the id on 201", async () => {
        let received: { body: unknown; type: string | null; correlation: string | null } | null =
            null;
        server.use(
            http.post(ENDPOINT, async ({ request }) => {
                received = {
                    body: await request.json(),
                    type: request.headers.get("Content-Type"),
                    correlation: request.headers.get("X-Correlation-ID"),
                };
                return HttpResponse.json({ status: "received", id: "msg-1" }, { status: 201 });
            }),
        );

        expect(await submitContact(values)).toEqual({ kind: "ok", id: "msg-1" });
        expect(received).toEqual({
            body: values,
            type: "application/json",
            correlation: expect.stringMatching(/^[0-9a-f-]{36}$/),
        });
    });

    it("returns field errors on 400 validation", async () => {
        const fieldErrors = { email: ["Enter a valid email address."] };
        server.use(
            http.post(ENDPOINT, () =>
                HttpResponse.json({ error: "validation", fieldErrors }, { status: 400 }),
            ),
        );

        expect(await submitContact(values)).toEqual({ kind: "validation", fieldErrors });
    });

    it("maps 429 to rate_limited", async () => {
        server.use(
            http.post(ENDPOINT, () =>
                HttpResponse.json({ error: "rate_limited" }, { status: 429 }),
            ),
        );

        expect(await submitContact(values)).toEqual({ kind: "rate_limited" });
    });

    it.each([
        ["a 500", () => HttpResponse.json({ error: "internal" }, { status: 500 })],
        [
            "a 400 without field errors",
            () => HttpResponse.json({ error: "invalid_json" }, { status: 400 }),
        ],
        ["a body that is not JSON", () => new HttpResponse("<html>", { status: 201 })],
    ])("maps %s to server", async (_case, resolver) => {
        server.use(http.post(ENDPOINT, resolver));

        expect(await submitContact(values)).toEqual({ kind: "server" });
    });

    it("maps a failed request to network", async () => {
        server.use(http.post(ENDPOINT, () => HttpResponse.error()));

        expect(await submitContact(values)).toEqual({ kind: "network" });
    });
});
