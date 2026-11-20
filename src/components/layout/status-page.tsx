import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import type { StatusPageContent } from "@/content/site";

import { Logo } from "./logo";

export type StatusPageProps = {
    content: Pick<StatusPageContent, "eyebrow" | "title" | "description">;
    /** Calls to action, laid out like the hero buttons. */
    actions: ReactNode;
    /** Optional small print under the actions (e.g. an error reference). */
    footnote?: ReactNode;
};

/**
 * Shared layout of the 404 page and the error boundary. It has its own `main#main`, so the skip
 * link still works, and no header or footer: their in-page anchors would not lead home from here.
 */
export function StatusPage({ content, actions, footnote }: StatusPageProps): ReactNode {
    return (
        // tabIndex lets the skip link move focus here in every browser; no ring on the whole page.
        <main id="main" tabIndex={-1} className="flex flex-1 items-center bg-muted outline-none">
            <Container className="flex flex-col items-start py-section">
                <Logo />
                <Eyebrow className="mt-12">{content.eyebrow}</Eyebrow>
                <h1 className="mt-4 max-w-140 text-h2">{content.title}</h1>
                <p className="mt-6 max-w-120 text-subtitle-1 text-muted-foreground">
                    {content.description}
                </p>
                <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    {actions}
                </div>
                {footnote}
            </Container>
        </main>
    );
}
