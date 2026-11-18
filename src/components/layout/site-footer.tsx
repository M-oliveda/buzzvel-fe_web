import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { footer } from "@/content/footer-links";

import { Logo } from "./logo";

/** Navy footer: brand and tagline, three link columns, copyright. */
export function SiteFooter(): ReactNode {
    return (
        <footer className="bg-navy text-on-dark">
            <Container className="pt-15 pb-6 lg:pt-20 lg:pb-10">
                <div className="grid grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-[2fr_1fr_1fr_1fr] lg:gap-8">
                    <div className="col-span-2 lg:col-span-1">
                        <Logo tone="on-dark" />
                        <p className="mt-2 text-body text-on-dark-subtle lg:mt-3 lg:max-w-60">
                            {footer.tagline}
                        </p>
                    </div>

                    {footer.columns.map((column, index) => {
                        const titleId = `footer-column-${index}`;

                        return (
                            <div key={column.title}>
                                <Eyebrow id={titleId} className="text-on-dark-muted">
                                    {column.title}
                                </Eyebrow>
                                <ul aria-labelledby={titleId} className="mt-4 flex flex-col gap-3">
                                    {column.links.map((link) => (
                                        <li key={link.label}>
                                            <Button
                                                asChild
                                                variant="nav"
                                                size="inline"
                                                className="text-on-dark-subtle hover:text-on-dark"
                                            >
                                                <a href={link.href}>{link.label}</a>
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 border-t border-muted-foreground pt-6 lg:mt-16">
                    <p className="text-center text-caption text-on-dark-muted lg:text-left">
                        {footer.copyright}
                    </p>
                </div>
            </Container>
        </footer>
    );
}
