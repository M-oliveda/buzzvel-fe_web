export type RateLimitResult = {
    allowed: boolean;
    /** Requests left in the current window. */
    remaining: number;
    /** Milliseconds until the window resets; 0 while requests are allowed. */
    retryAfterMs: number;
};

export type RateLimiter = {
    consume: (key: string) => RateLimitResult;
};

export type RateLimiterOptions = {
    max: number;
    windowMs: number;
    /** Clock, injectable for tests. */
    now?: () => number;
    /** Key count above which expired windows are swept, so memory stays bounded. */
    sweepThreshold?: number;
};

type Window = { count: number; resetAt: number };

/**
 * Fixed-window, in-memory rate limiter (MASTERPLAN §11.3). State lives in this process only, so
 * on Cloud Run each instance counts separately: a documented known gap.
 */
export function createRateLimiter({
    max,
    windowMs,
    now = Date.now,
    sweepThreshold = 10_000,
}: RateLimiterOptions): RateLimiter {
    const windows = new Map<string, Window>();

    const sweep = (time: number): void => {
        for (const [key, window] of windows) {
            if (window.resetAt <= time) windows.delete(key);
        }
    };

    return {
        consume(key) {
            const time = now();
            if (windows.size > sweepThreshold) sweep(time);

            let window = windows.get(key);
            if (!window || window.resetAt <= time) {
                window = { count: 0, resetAt: time + windowMs };
                windows.set(key, window);
            }

            if (window.count >= max) {
                return { allowed: false, remaining: 0, retryAfterMs: window.resetAt - time };
            }

            window.count += 1;
            return { allowed: true, remaining: max - window.count, retryAfterMs: 0 };
        },
    };
}
