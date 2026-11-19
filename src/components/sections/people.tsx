import Image from "next/image";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { people, type CollageImage } from "@/content/home";
import { sectionIds } from "@/content/site";
import { cn } from "@/lib/cn";

// The collage is laid out in design pixels on a 520 px-wide frame and scaled with container
// query units. Vertical sizes are also multiplied by --collage-y: the mobile frame shows the same
// collage about 10 % shorter for its width.
const COLLAGE_WIDTH = 520;

function cqw(px: number): string {
    return `${((px / COLLAGE_WIDTH) * 100).toFixed(3)}cqw`;
}

/** Vertical design pixels: scaled like `cqw`, then by the breakpoint's `--collage-y` factor. */
function cqy(px: number): string {
    return `calc(${cqw(px)} * var(--collage-y))`;
}

/** Copy and call to action beside a photo collage on a blue disc (collage below on mobile). */
export function People(): ReactNode {
    return (
        <section
            id={sectionIds.community}
            aria-labelledby="people-title"
            className="overflow-hidden bg-muted"
        >
            <Container className="grid items-center gap-6 py-section lg:grid-cols-2 lg:gap-15">
                <Reveal className="flex flex-col items-start">
                    <SectionHeading
                        titleId="people-title"
                        spacing="loose"
                        eyebrow={people.eyebrow}
                        title={people.title}
                        description={people.description}
                    />
                    <Button asChild variant="outline" className="mt-8">
                        <a href={people.cta.href}>{people.cta.label}</a>
                    </Button>
                </Reveal>

                <Reveal
                    delay={0.1}
                    className="@container mx-auto w-full max-w-132.5 [--collage-y:0.9] lg:[--collage-y:1]"
                >
                    <div
                        role="group"
                        aria-label={people.collageLabel}
                        className="relative flex items-center justify-center"
                        style={{ gap: cqw(16) }}
                    >
                        <div
                            aria-hidden="true"
                            className="absolute top-1/2 left-1/2 aspect-square -translate-1/2 rounded-full bg-secondary"
                            style={{ width: cqw(500) }}
                        />
                        {people.columns.map((column, index) => (
                            <div
                                // Static, never reordered: the index is a stable key.
                                key={index}
                                className={cn(
                                    "relative flex flex-col",
                                    column.align === "end" ? "items-end" : "items-start",
                                )}
                                style={{ gap: cqy(12.84), paddingTop: cqy(column.offset) }}
                            >
                                {column.images.map((image) => (
                                    <CollagePhoto key={image.src} image={image} />
                                ))}
                            </div>
                        ))}
                    </div>
                </Reveal>
            </Container>
        </section>
    );
}

type CollagePhotoProps = {
    image: CollageImage;
};

function CollagePhoto({ image }: CollagePhotoProps): ReactNode {
    return (
        <span
            className="relative block overflow-hidden rounded bg-secondary shadow-dark-m"
            style={{ width: cqw(image.frame.width), height: cqy(image.frame.height) }}
        >
            <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={`(min-width: 33.125rem) ${Math.round(image.frame.width)}px, ${Math.round((image.frame.width / COLLAGE_WIDTH) * 100)}vw`}
                className="object-cover"
            />
        </span>
    );
}
