import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { site } from "@/content/site";

import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

/** Sticky top bar. Desktop shows the nav inline; below `lg` it collapses into the mobile menu. */
export function SiteHeader(): ReactNode {
    return (
        <header className="sticky top-0 z-40 h-header border-b border-border bg-muted">
            <Container className="flex h-full items-center justify-between gap-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
                <Logo />

                <nav aria-label={site.nav.label} className="hidden lg:block">
                    <ul className="flex items-center gap-8">
                        {site.nav.links.map((link) => (
                            <li key={link.href}>
                                <Button asChild variant="nav" size="inline">
                                    <a href={link.href}>{link.label}</a>
                                </Button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="hidden items-center justify-self-end lg:flex lg:gap-2">
                    <Button asChild variant="ghost" size="sm" className="px-4">
                        <a href={site.actions.login.href}>{site.actions.login.label}</a>
                    </Button>
                    <Button asChild size="sm">
                        <a href={site.actions.primary.href}>{site.actions.primary.label}</a>
                    </Button>
                </div>

                <MobileMenu className="lg:hidden" />
            </Container>
        </header>
    );
}
