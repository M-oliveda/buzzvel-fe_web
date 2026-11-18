import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export type CardProps = ComponentProps<"div"> & {
    /** Render the single child (e.g. a link card) with card styling. */
    asChild?: boolean;
};

export function Card({ className, asChild = false, ...props }: CardProps): ReactNode {
    const Comp = asChild ? Slot : "div";

    return (
        <Comp
            data-slot="card"
            className={cn(
                "flex flex-col gap-6 rounded-xl border border-border bg-card p-7 text-card-foreground",
                className,
            )}
            {...props}
        />
    );
}

export type CardHeaderProps = ComponentProps<"div">;

export function CardHeader({ className, ...props }: CardHeaderProps): ReactNode {
    return (
        <div data-slot="card-header" className={cn("flex flex-col gap-2", className)} {...props} />
    );
}

export type CardTitleProps = ComponentProps<"h3"> & {
    /** Swap the heading element (e.g. an `h2`) to keep the document outline in order. */
    asChild?: boolean;
};

export function CardTitle({ className, asChild = false, ...props }: CardTitleProps): ReactNode {
    const Comp = asChild ? Slot : "h3";

    return <Comp data-slot="card-title" className={cn("text-h5", className)} {...props} />;
}

export type CardDescriptionProps = ComponentProps<"p">;

export function CardDescription({ className, ...props }: CardDescriptionProps): ReactNode {
    return (
        <p
            data-slot="card-description"
            className={cn("text-body text-muted-foreground", className)}
            {...props}
        />
    );
}

export type CardContentProps = ComponentProps<"div">;

export function CardContent({ className, ...props }: CardContentProps): ReactNode {
    return <div data-slot="card-content" className={cn(className)} {...props} />;
}

export type CardFooterProps = ComponentProps<"div">;

export function CardFooter({ className, ...props }: CardFooterProps): ReactNode {
    return (
        <div data-slot="card-footer" className={cn("flex items-center", className)} {...props} />
    );
}
