"use client";

import { domAnimation, LazyMotion, MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export type MotionProviderProps = {
    children: ReactNode;
};

/**
 * Makes every framer-motion animation follow the user's `prefers-reduced-motion` setting, so
 * the reduced-motion rule lives in one place (MASTERPLAN §8, Motion). `LazyMotion` ships only the
 * `domAnimation` features (animations, gestures, `whileInView`); `strict` makes a stray full
 * `motion.*` component throw instead of silently pulling the whole bundle back in.
 */
export function MotionProvider({ children }: MotionProviderProps): ReactNode {
    return (
        <LazyMotion features={domAnimation} strict>
            <MotionConfig reducedMotion="user">{children}</MotionConfig>
        </LazyMotion>
    );
}
