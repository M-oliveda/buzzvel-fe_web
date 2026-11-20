import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { site } from "@/content/site";
import { cn } from "@/lib/cn";

export type LogoProps = {
    /** `on-dark` uses the white wordmark for the navy footer. */
    tone?: "default" | "on-dark";
    className?: string;
};

/** The `luma.` wordmark, linking to the top of the home page. */
export function Logo({ tone = "default", className }: LogoProps): ReactNode {
    return (
        <Link
            href="/"
            aria-label={site.logo.label}
            className={cn("inline-flex shrink-0 rounded-sm", className)}
        >
            {/* The link carries the accessible name, so the wordmark itself is decorative. */}
            <Image
                src={tone === "on-dark" ? site.logo.srcOnDark : site.logo.src}
                alt=""
                width={site.logo.width}
                height={site.logo.height}
                unoptimized
            />
        </Link>
    );
}
