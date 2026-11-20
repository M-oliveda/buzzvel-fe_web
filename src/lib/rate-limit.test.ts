// @vitest-environment node
import { createRateLimiter } from "./rate-limit";

function clock(start = 0): { now: () => number; advance: (ms: number) => void } {
    let time = start;
    return { now: () => time, advance: (ms) => (time += ms) };
}

describe("createRateLimiter", () => {
    it("allows up to `max` requests per window and counts down what is left", () => {
        const { now } = clock();
        const limiter = createRateLimiter({ max: 2, windowMs: 1000, now });

        expect(limiter.consume("ip")).toEqual({ allowed: true, remaining: 1, retryAfterMs: 0 });
        expect(limiter.consume("ip")).toEqual({ allowed: true, remaining: 0, retryAfterMs: 0 });
    });

    it("blocks once the window is used up and says when to retry", () => {
        const time = clock();
        const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: time.now });

        limiter.consume("ip");
        time.advance(400);

        expect(limiter.consume("ip")).toEqual({ allowed: false, remaining: 0, retryAfterMs: 600 });
    });

    it("starts a fresh window after the old one expires", () => {
        const time = clock();
        const limiter = createRateLimiter({ max: 1, windowMs: 1000, now: time.now });

        limiter.consume("ip");
        time.advance(1000);

        expect(limiter.consume("ip").allowed).toBe(true);
    });

    it("counts each key separately", () => {
        const { now } = clock();
        const limiter = createRateLimiter({ max: 1, windowMs: 1000, now });

        limiter.consume("a");

        expect(limiter.consume("a").allowed).toBe(false);
        expect(limiter.consume("b").allowed).toBe(true);
    });

    it("sweeps expired windows once there are many keys, keeping live ones", () => {
        const time = clock();
        const limiter = createRateLimiter({
            max: 1,
            windowMs: 1000,
            now: time.now,
            sweepThreshold: 2,
        });

        limiter.consume("old-1");
        limiter.consume("old-2");
        time.advance(500);
        limiter.consume("live");
        time.advance(600); // old-* expired, live still has 400 ms

        // Triggers the sweep (3 keys > 2); live must still be limited afterwards.
        expect(limiter.consume("new").allowed).toBe(true);
        expect(limiter.consume("live").allowed).toBe(false);
        expect(limiter.consume("old-1").allowed).toBe(true);
    });
});
