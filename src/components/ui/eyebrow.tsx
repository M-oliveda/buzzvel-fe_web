import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

// Overline text above headings ("Learn at your own pace") and the step labels.
export const eyebrowVariants = cva("text-overline uppercase", {
    variants: {
        tone: {
            primary: "text-primary",
            muted: "text-subtle-foreground",
            "on-dark": "text-on-dark",
        },
    },
    defaultVariants: {
        tone: "primary",
    },
});

export type EyebrowVariantProps = VariantProps<typeof eyebrowVariants>;

export type EyebrowProps = ComponentProps<"p"> &
    EyebrowVariantProps & {
        asChild?: boolean;
    };

export function Eyebrow({ className, tone, asChild = false, ...props }: EyebrowProps): ReactNode {
    const Comp = asChild ? Slot : "p";

    return (
        <Comp data-slot="eyebrow" className={cn(eyebrowVariants({ tone }), className)} {...props} />
    );
}
