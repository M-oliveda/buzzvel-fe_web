"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

export type MotionProviderProps = {
    children: ReactNode;
};

/**
 * Makes every framer-motion animation follow the user's `prefers-reduced-motion` setting, so
 * the reduced-motion rule lives in one place (MASTERPLAN §8, Motion).
 */
export function MotionProvider({ children }: MotionProviderProps): ReactNode {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
