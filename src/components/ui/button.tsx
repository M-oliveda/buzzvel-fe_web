import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

// Padding-based sizes (not fixed heights) match the Figma frames: the outline variant's 1 px
// border makes it 54 px next to a 52 px filled button, and rows stretch them to the same height.
// The focus ring comes from the global `:focus-visible` rule in globals.css (ring token).
export const buttonVariants = cva(
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-body font-bold whitespace-nowrap transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-primary-foreground hover:bg-primary/90",
                secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                accent: "bg-accent text-accent-foreground hover:bg-accent/85",
                outline: "border border-border bg-background text-foreground hover:bg-muted",
                ghost: "font-normal text-muted-foreground hover:bg-muted hover:text-foreground",
                link: "text-foreground underline-offset-4 hover:underline",
                // Header and footer navigation: regular weight, colour change on hover.
                nav: "font-normal text-muted-foreground hover:text-foreground",
            },
            size: {
                sm: "px-5 py-2.5",
                default: "px-7 py-3.5",
                lg: "px-8 py-4",
                icon: "size-11",
                inline: "p-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;

export type ButtonProps = ComponentProps<"button"> &
    ButtonVariantProps & {
        /** Render the single child (e.g. a Next.js `Link`) with button styling instead of a `<button>`. */
        asChild?: boolean;
    };

export function Button({
    className,
    variant,
    size,
    asChild = false,
    type,
    ...props
}: ButtonProps): ReactNode {
    if (asChild) {
        return (
            <Slot
                data-slot="button"
                className={cn(buttonVariants({ variant, size }), className)}
                {...props}
            />
        );
    }

    return (
        <button
            data-slot="button"
            // Default to "button" so a Button inside a form never submits by accident.
            type={type ?? "button"}
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    );
}
