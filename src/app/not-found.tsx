import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { StatusPage } from "@/components/layout/status-page";
import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

const { notFound } = site.statusPages;

// Next.js also adds `<meta name="robots" content="noindex">` and the 404 status.
export const metadata: Metadata = {
    title: `${notFound.title} — ${site.name}`,
};

/** 404 page for every unmatched URL (MASTERPLAN §7). */
export default function NotFound(): ReactNode {
    return (
        <StatusPage
            content={notFound}
            actions={
                <Button asChild>
                    <Link href={notFound.home.href}>{notFound.home.label}</Link>
                </Button>
            }
        />
    );
}
