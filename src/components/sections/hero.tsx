import Image from "next/image";
import type { ReactNode } from "react";

import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { hero } from "@/content/home";

/** Opening section with the page's only `h1` and the LCP image. */
export function Hero(): ReactNode {
    return (
        <section aria-labelledby="hero-title" className="overflow-hidden bg-muted">
            <Container className="grid items-start gap-12 py-section lg:grid-cols-2 lg:gap-15 xl:grid-cols-[1fr_31.25rem]">
                <div className="flex flex-col items-start">
                    <Eyebrow>{hero.eyebrow}</Eyebrow>
                    <h1 id="hero-title" className="mt-4 max-w-140 text-h1">
                        {hero.title}
                    </h1>
                    <p className="mt-6 max-w-120 text-subtitle-1 text-muted-foreground">
                        {hero.description}
                    </p>

                    <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Button asChild>
                            <a href={hero.primary.href}>{hero.primary.label}</a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href={hero.secondary.href}>{hero.secondary.label}</a>
                        </Button>
                    </div>

                    <div className="mt-8 flex items-center gap-3 self-center sm:self-start">
                        <AvatarStack avatars={hero.trust.avatars} />
                        <p className="text-body text-muted-foreground">
                            <strong className="font-bold text-foreground">
                                {hero.trust.highlight}
                            </strong>{" "}
                            {hero.trust.rest}
                        </p>
                    </div>
                </div>

                <HeroVisual />
            </Container>
        </section>
    );
}

function HeroVisual(): ReactNode {
    return (
        // Mobile frame: photo above the copy, 346 × 380 (8 px inside the gutter); 500 × 520 from sm.
        <div className="relative order-first mx-auto aspect-[346/380] w-[calc(100%-1rem)] sm:aspect-[500/520] sm:w-full sm:max-w-125 lg:order-none lg:mx-0">
            {/* Decorative shapes behind the photo (peach bar, blue disc). */}
            <div
                aria-hidden="true"
                className="absolute top-6 -right-4.5 bottom-4 w-22 rounded-xl bg-peach sm:-right-10 sm:bottom-7"
            />
            <div
                aria-hidden="true"
                className="absolute bottom-3 -left-4.5 size-26.5 rounded-full bg-secondary sm:-left-11"
            />

            <div className="relative size-full overflow-hidden rounded-2xl bg-secondary">
                <Image
                    src={hero.image.src}
                    alt={hero.image.alt}
                    fill
                    preload
                    sizes="(min-width: 36rem) 500px, calc(100vw - 2.5rem)"
                    className="object-cover"
                />
            </div>

            <div className="absolute top-1.5 -left-2 flex items-center gap-3 rounded-lg bg-background px-4 py-3 shadow-float motion-safe:animate-float sm:top-4 sm:-left-5.5">
                <span className="flex h-8 items-center rounded-md bg-secondary px-1 text-body font-bold text-primary">
                    {hero.coursesChip.value}
                </span>
                <span className="text-body text-foreground">{hero.coursesChip.label}</span>
            </div>

            <div className="absolute -right-4.5 bottom-9 flex items-center gap-2 rounded-lg bg-background px-4 py-3 shadow-float motion-safe:animate-float-offset sm:-right-14">
                <span aria-hidden="true" className="flex gap-0.5">
                    {Array.from({ length: hero.ratingChip.stars }, (_, index) => (
                        <Image key={index} src="/icons/star.svg" alt="" width={14} height={14} />
                    ))}
                </span>
                <span className="text-body text-foreground">{hero.ratingChip.label}</span>
            </div>
        </div>
    );
}
