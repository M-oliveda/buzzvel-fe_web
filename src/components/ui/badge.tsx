import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

// Non-interactive labels. `default` is the yellow "Featured course" tag, `secondary` the category
// number chip, `outline` the course-detail chips (colour follows the surrounding text).
export const badgeVariants = cva("inline-flex w-fit shrink-0 items-center whitespace-nowrap", {
    variants: {
        variant: {
            default:
                "rounded-sm bg-accent px-3 py-1.5 text-overline text-accent-foreground uppercase",
            secondary: "rounded-sm bg-secondary px-2 py-1 text-overline text-primary uppercase",
            outline: "rounded-md border border-border px-3.5 py-1.5 text-body",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});

export type BadgeVariantProps = VariantProps<typeof badgeVariants>;

export type BadgeProps = ComponentProps<"span"> &
    BadgeVariantProps & {
        asChild?: boolean;
    };

export function Badge({ className, variant, asChild = false, ...props }: BadgeProps): ReactNode {
    const Comp = asChild ? Slot : "span";

    return (
        <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
    );
}
