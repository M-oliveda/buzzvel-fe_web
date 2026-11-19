"use client";

import {
    animate,
    m,
    useInView,
    useMotionValue,
    useReducedMotion,
    useTransform,
} from "framer-motion";
import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ParsedStatValue = {
    prefix: string;
    number: number;
    decimals: number;
    suffix: string;
};

/** Splits a display value such as `24K+` or `92%` into its number and the text around it. */
export function parseStatValue(value: string): ParsedStatValue | null {
    const match = /^(\D*)(\d+(?:\.(\d+))?)(\D*)$/.exec(value);
    if (!match) return null;

    const [, prefix = "", digits = "", fraction = "", suffix = ""] = match;
    return { prefix, number: Number(digits), decimals: fraction.length, suffix };
}

export type CountUpProps = {
    /** Final value as displayed; always in the DOM for screen readers and without JavaScript. */
    value: string;
    className?: string;
};

/**
 * Counts a stat up from zero the first time it is visible (MASTERPLAN §10.5). The server renders
 * the final value; with motion allowed, the client resets it to zero before it scrolls into view.
 * Assistive technology reads the final value from visually hidden text, never the moving digits.
 */
export function CountUp({ value, className }: CountUpProps): ReactNode {
    const parsed = parseStatValue(value);

    return (
        <span className={cn("tabular-nums", className)}>
            <span className="sr-only">{value}</span>
            {parsed ? <AnimatedNumber parsed={parsed} /> : <span aria-hidden="true">{value}</span>}
        </span>
    );
}

function AnimatedNumber({ parsed }: { parsed: ParsedStatValue }): ReactNode {
    const { prefix, number, decimals, suffix } = parsed;
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.6 });
    const reduceMotion = useReducedMotion();
    // Starts at the final value so the server HTML and the first client render show it.
    const count = useMotionValue(number);
    const text = useTransform(count, (latest) => `${prefix}${latest.toFixed(decimals)}${suffix}`);
    // Set once the number was reset to zero off-screen; only then is there anything to animate.
    const armed = useRef(false);

    useEffect(() => {
        // `useReducedMotion` is read once per mount, so a reduced-motion visitor is never armed.
        if (reduceMotion || armed.current || inView) return;
        count.set(0);
        armed.current = true;
    }, [count, inView, reduceMotion]);

    useEffect(() => {
        if (!armed.current || !inView) return;

        const controls = animate(count, number, { duration: 1.6, ease: "easeOut" });
        return () => controls.stop();
    }, [count, inView, number]);

    return (
        <m.span ref={ref} aria-hidden="true">
            {text}
        </m.span>
    );
}
