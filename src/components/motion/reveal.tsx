"use client";

import { m, useReducedMotion, type MotionProps, type Variants } from "framer-motion";
import type { ReactNode } from "react";

const variants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
};

export type RevealProps = {
    children: ReactNode;
    /** Seconds to wait once in view; used to stagger cards and steps. */
    delay?: number;
    className?: string;
};

/**
 * Fades and lifts its content in the first time it scrolls into view (MASTERPLAN §10.5). Only
 * opacity and transform change, so there is no layout shift. Under reduced motion the content
 * jumps to its final state as soon as the page hydrates, wherever it is on the page. Never wrap
 * the hero: it holds the LCP image and the `h1`.
 */
export function Reveal({ children, delay = 0, className }: RevealProps): ReactNode {
    const reduceMotion = useReducedMotion();

    // `initial={false}` alone would keep the server's inline `opacity: 0` (the server cannot know
    // the preference, and React does not patch inline styles at hydration). With an `animate`
    // target, framer resolves the first render to the visible values and writes them on mount.
    const trigger: MotionProps = reduceMotion
        ? { initial: false, animate: "visible" }
        : {
              initial: "hidden",
              whileInView: "visible",
              viewport: { once: true, amount: 0.2 },
              transition: { duration: 0.6, ease: "easeOut", delay },
          };

    return (
        <m.div data-slot="reveal" className={className} variants={variants} {...trigger}>
            {children}
        </m.div>
    );
}
