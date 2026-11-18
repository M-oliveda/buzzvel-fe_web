import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type LabelProps = ComponentProps<"label">;

export function Label({ className, ...props }: LabelProps): ReactNode {
    return (
        <label
            data-slot="label"
            className={cn("text-body font-bold text-foreground", className)}
            {...props}
        />
    );
}
