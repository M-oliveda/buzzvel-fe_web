"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
].join(",");

/** Focusable descendants in DOM order, skipping anything inside a `hidden` or `inert` subtree. */
export function getFocusable(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => !element.closest("[hidden], [inert]"),
    );
}

export type FocusTrapOptions = {
    /** Element whose first focusable descendant receives focus on activation. Defaults to the container. */
    initialFocus?: RefObject<HTMLElement | null>;
};

/**
 * While `active`, keeps Tab and Shift+Tab cycling inside `container` and moves focus into it
 * (MASTERPLAN §10.5, mobile menu). Restoring focus on close is left to the caller, which knows
 * whether the close came from `Esc` (restore) or a link (follow the link).
 */
export function useFocusTrap(
    container: RefObject<HTMLElement | null>,
    active: boolean,
    { initialFocus }: FocusTrapOptions = {},
): void {
    useEffect(() => {
        const root = container.current;
        if (!active || !root) return;

        const start = initialFocus?.current ?? root;
        getFocusable(start)[0]?.focus();

        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== "Tab") return;

            const focusable = getFocusable(root);
            const first = focusable[0];
            const last = focusable.at(-1);
            if (!first || !last) return;

            const current = document.activeElement;
            const outside = !(current instanceof Node) || !root.contains(current);

            if (event.shiftKey && (current === first || outside)) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && (current === last || outside)) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [container, active, initialFocus]);
}
