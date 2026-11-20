"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { StatusPage } from "@/components/layout/status-page";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

const { error: copy } = site.statusPages;

export type ErrorPageProps = {
    /** Whatever was thrown; only Server Component errors are guaranteed to be `Error`s. */
    error: unknown;
    /** Re-fetches and re-renders the segment (Next.js 16; replaces `reset`). */
    retry: () => void;
};

/** Server errors carry a `digest` that matches the server logs; never show their message. */
function digestOf(error: unknown): string | undefined {
    if (!(error instanceof Error)) return undefined;
    const digest: unknown = Reflect.get(error, "digest");
    return typeof digest === "string" ? digest : undefined;
}

/**
 * Error boundary for the page (MASTERPLAN §7). Shows a calm message, a retry and a way home, plus
 * the error digest so a report can be matched to the server logs. The error is not logged here:
 * server errors are already in the server logs and AGENTS §8 forbids stray `console` calls.
 */
export default function ErrorPage({ error, retry }: ErrorPageProps): ReactNode {
    const digest = digestOf(error);

    return (
        <StatusPage
            content={copy}
            actions={
                <>
                    <Button type="button" onClick={retry}>
                        {copy.retry}
                    </Button>
                    <Button asChild variant="outline">
                        <Link href={copy.home.href}>{copy.home.label}</Link>
                    </Button>
                </>
            }
            footnote={
                digest ? (
                    <p className="mt-8 text-body text-muted-foreground">
                        {copy.reference}: <code>{digest}</code>
                    </p>
                ) : null
            }
        />
    );
}
