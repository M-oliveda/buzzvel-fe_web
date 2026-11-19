"use client";

import { useEffect } from "react";

/**
 * Stops the page behind an overlay from scrolling while `locked` (MASTERPLAN §10.5). The previous
 * inline `overflow` value is restored on unlock or unmount, so nested callers do not clobber it.
 */
export function useBodyScrollLock(locked: boolean): void {
    useEffect(() => {
        if (!locked) return;

        const { body } = document;
        const previous = body.style.overflow;
        body.style.overflow = "hidden";

        return () => {
            body.style.overflow = previous;
        };
    }, [locked]);
}
