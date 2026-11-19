// jsdom has no IntersectionObserver or matchMedia; framer-motion's `whileInView`, `useInView` and
// `useReducedMotion` need both. These stubs are installed in vitest.setup.ts.

type Observed = { callback: IntersectionObserverCallback; observer: IntersectionObserver };

const observed = new Map<Element, Observed>();

class StubIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin = "0px";
    readonly scrollMargin = "0px";
    readonly thresholds: readonly number[] = [0];

    constructor(private readonly callback: IntersectionObserverCallback) {}

    observe(target: Element): void {
        observed.set(target, { callback: this.callback, observer: this });
    }

    unobserve(target: Element): void {
        observed.delete(target);
    }

    disconnect(): void {
        for (const [target, entry] of observed) {
            if (entry.observer === this) observed.delete(target);
        }
    }

    takeRecords(): IntersectionObserverEntry[] {
        return [];
    }
}

/** Reports every observed element as entering (or leaving) the viewport. */
export function triggerIntersection(isIntersecting = true): void {
    for (const [target, { callback, observer }] of [...observed]) {
        const rect = target.getBoundingClientRect();
        const entry: IntersectionObserverEntry = {
            target,
            isIntersecting,
            intersectionRatio: isIntersecting ? 1 : 0,
            boundingClientRect: rect,
            intersectionRect: rect,
            rootBounds: null,
            time: performance.now(),
        };
        callback([entry], observer);
    }
}

// framer-motion reads `(prefers-reduced-motion)` once per process and then listens for `change`,
// so the stub keeps live `matches` getters and notifies listeners when the preference flips.
let reducedMotion = false;
const motionListeners = new Set<() => void>();

function stubMatchMedia(query: string): MediaQueryList {
    const isMotionQuery = query.includes("prefers-reduced-motion");
    return {
        get matches() {
            return isMotionQuery && reducedMotion;
        },
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: () => void) => {
            if (isMotionQuery) motionListeners.add(listener);
        },
        removeEventListener: (_type: string, listener: () => void) => {
            motionListeners.delete(listener);
        },
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
    } as unknown as MediaQueryList;
}

/** Sets the user's reduced-motion preference for the current test. */
export function setReducedMotion(reduce: boolean): void {
    reducedMotion = reduce;
    for (const listener of motionListeners) listener();
}

export function installBrowserStubs(): void {
    observed.clear();
    globalThis.IntersectionObserver = StubIntersectionObserver;
    window.matchMedia = stubMatchMedia;
    setReducedMotion(false);
}
