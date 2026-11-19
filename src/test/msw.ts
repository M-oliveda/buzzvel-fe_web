import { setupServer } from "msw/node";

/** Shared MSW server for client-side tests; each test registers its own handlers with `use`. */
export const server = setupServer();

/**
 * Starts MSW for the calling test file and fails on any request no handler expects.
 * (MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.)
 */
export function setupMswServer(): void {
    beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());
}
