import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Eyebrow } from "./eyebrow";

const sectionHeadingVariants = cva("flex flex-col", {
    variants: {
        align: {
            start: "items-start text-left",
            center: "items-center text-center",
        },
        tone: {
            default: "",
            "on-dark": "text-on-dark",
        },
    },
    defaultVariants: {
        align: "start",
        tone: "default",
    },
});

// Section titles use the design's H3 style (48/56); the closing CTA uses the larger H2 (56/64).
const titleVariants = cva("", {
    variants: {
        size: {
            default: "text-h3",
            lg: "text-h2",
        },
        // Gaps eyebrow → title → description: 16/16 in most sections, 8/32 in the people section
        // (8/24 on mobile).
        spacing: {
            default: "mt-4",
            loose: "mt-2",
        },
    },
    defaultVariants: {
        size: "default",
        spacing: "default",
    },
});

export type SectionHeadingProps = VariantProps<typeof sectionHeadingVariants> &
    VariantProps<typeof titleVariants> & {
        title: ReactNode;
        eyebrow?: ReactNode;
        description?: ReactNode;
        /** Lets the section point `aria-labelledby` at its heading. */
        titleId?: string;
        className?: string;
        /** Overrides the description's type size where a frame deviates (e.g. contact on mobile). */
        descriptionClassName?: string;
    };

/** Eyebrow + `h2` + intro paragraph, the heading block every section opens with. */
export function SectionHeading({
    title,
    eyebrow,
    description,
    titleId,
    align,
    tone,
    size,
    spacing,
    className,
    descriptionClassName,
}: SectionHeadingProps): ReactNode {
    const onDark = tone === "on-dark";

    return (
        <div
            data-slot="section-heading"
            className={cn(sectionHeadingVariants({ align, tone }), className)}
        >
            {eyebrow ? <Eyebrow tone={onDark ? "on-dark" : "primary"}>{eyebrow}</Eyebrow> : null}
            <h2 id={titleId} className={cn(titleVariants({ size, spacing }), !eyebrow && "mt-0")}>
                {title}
            </h2>
            {description ? (
                <p
                    className={cn(
                        "text-subtitle-1",
                        spacing === "loose" ? "mt-6 lg:mt-8" : "mt-4",
                        onDark ? "text-on-dark" : "text-muted-foreground",
                        descriptionClassName,
                    )}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}
