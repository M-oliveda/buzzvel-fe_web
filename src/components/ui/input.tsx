import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

// Shared by Input and Textarea so both controls stay visually identical.
export const controlClassName =
    "w-full rounded-md border border-input bg-muted px-4 text-body text-foreground transition-colors placeholder:text-subtle-foreground hover:border-subtle-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive";

export type InputProps = ComponentProps<"input">;

export function Input({ className, type, ...props }: InputProps): ReactNode {
    return (
        <input
            data-slot="input"
            type={type ?? "text"}
            className={cn(controlClassName, "h-12 py-3", className)}
            {...props}
        />
    );
}
