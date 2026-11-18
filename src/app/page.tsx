import type { ReactNode } from "react";

import { site } from "@/content/site";

// Phase 1 placeholder. The sections from MASTERPLAN §6.1 replace it in Phase 3.
export default function HomePage(): ReactNode {
    return (
        <main
            id="main"
            className="flex flex-1 flex-col justify-center bg-muted px-gutter py-section"
        >
            <div className="mx-auto flex w-full max-w-content flex-col items-start gap-4">
                <p className="text-overline text-primary uppercase">{site.name}</p>
                <h1 className="max-w-140 text-h1">{site.placeholder.heading}</h1>
                <p className="max-w-140 text-subtitle-1 text-muted-foreground">
                    {site.placeholder.body}
                </p>
            </div>
        </main>
    );
}
