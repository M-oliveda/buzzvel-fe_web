import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { controlClassName } from "./input";

export type TextareaProps = ComponentProps<"textarea">;

export function Textarea({ className, ...props }: TextareaProps): ReactNode {
    return (
        <textarea
            data-slot="textarea"
            className={cn(controlClassName, "min-h-30 resize-y py-3.5", className)}
            {...props}
        />
    );
}
