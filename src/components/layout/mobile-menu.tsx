"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/content/site";
import { useBodyScrollLock } from "@/hooks/use-body-scroll-lock";
import { useFocusTrap } from "@/hooks/use-focus-trap";

// Matches Tailwind's `lg` breakpoint, where the inline desktop nav takes over.
const DESKTOP_QUERY = "(min-width: 64rem)";

export type MobileMenuProps = {
    className?: string;
};

/**
 * Menu button and drop-down panel for viewports below `lg` (MASTERPLAN §10.5). While open, focus
 * moves to the first link and is trapped between the button and the panel, the page behind it
 * does not scroll, and `Esc` closes the menu and returns focus to the button. It also closes on
 * link click and when the viewport grows to desktop.
 */
export function MobileMenu({ className }: MobileMenuProps): ReactNode {
    const [open, setOpen] = useState(false);
    const panelId = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    useFocusTrap(rootRef, open, { initialFocus: panelRef });
    useBodyScrollLock(open);

    useEffect(() => {
        if (!open) return;

        const closeOnEscape = (event: KeyboardEvent): void => {
            if (event.key !== "Escape") return;
            setOpen(false);
            buttonRef.current?.focus();
        };

        document.addEventListener("keydown", closeOnEscape);
        return () => document.removeEventListener("keydown", closeOnEscape);
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const query = window.matchMedia(DESKTOP_QUERY);
        const closeOnDesktop = (event: MediaQueryListEvent): void => {
            if (event.matches) setOpen(false);
        };

        query.addEventListener("change", closeOnDesktop);
        return () => query.removeEventListener("change", closeOnDesktop);
    }, [open]);

    const close = (): void => setOpen(false);

    return (
        <div ref={rootRef} className={className}>
            <Button
                ref={buttonRef}
                variant="ghost"
                size="icon"
                aria-label={site.menuLabel}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpen((value) => !value)}
                className="-mr-2.5 text-foreground"
            >
                {open ? (
                    <X aria-hidden="true" className="size-6" />
                ) : (
                    <Menu aria-hidden="true" className="size-6" />
                )}
            </Button>

            <div
                ref={panelRef}
                id={panelId}
                hidden={!open}
                className="fixed inset-x-0 top-header bottom-0 z-40 overflow-y-auto bg-muted"
            >
                <Container className="flex flex-col gap-8 py-8">
                    <nav aria-label={site.nav.label}>
                        <ul className="flex flex-col">
                            {site.nav.links.map((link) => (
                                <li key={link.href} className="border-b border-border">
                                    <Button
                                        asChild
                                        variant="nav"
                                        size="inline"
                                        className="w-full justify-start py-3.5 text-subtitle-1 text-foreground"
                                    >
                                        <a href={link.href} onClick={close}>
                                            {link.label}
                                        </a>
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex flex-col gap-3">
                        <Button asChild variant="outline">
                            <a href={site.actions.login.href} onClick={close}>
                                {site.actions.login.label}
                            </a>
                        </Button>
                        <Button asChild>
                            <a href={site.actions.primary.href} onClick={close}>
                                {site.actions.primary.label}
                            </a>
                        </Button>
                    </div>
                </Container>
            </div>
        </div>
    );
}
