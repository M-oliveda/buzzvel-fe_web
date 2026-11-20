import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { site } from "@/content/site";

/** First focusable element on the page; visible only while focused (MASTERPLAN §10.5). */
export function SkipLink(): ReactNode {
    return (
        <Button
            asChild
            size="sm"
            className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-50"
        >
            <a href="#main">{site.skipLink}</a>
        </Button>
    );
}
