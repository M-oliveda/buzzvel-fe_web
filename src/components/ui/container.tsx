import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type ContainerProps = ComponentProps<"div"> & {
    asChild?: boolean;
};

/**
 * Centred content column: `max-w-content` (1120 px) plus the fluid side gutter. `box-content`
 * makes the max-width apply to the content box, so the gutter is added outside the 1120 px.
 */
export function Container({ className, asChild = false, ...props }: ContainerProps): ReactNode {
    const Comp = asChild ? Slot : "div";

    return (
        <Comp
            data-slot="container"
            className={cn("mx-auto box-content max-w-content px-gutter", className)}
            {...props}
        />
    );
}
