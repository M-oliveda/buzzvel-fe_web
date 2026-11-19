import Image from "next/image";
import type { ReactNode } from "react";

import { CountUp } from "@/components/motion/count-up";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { testimonial } from "@/content/home";
import { stats } from "@/content/stats";

/**
 * Learner quote and headline numbers. Stats sit in a row under the quote on mobile and tablet
 * (mobile frame) and form a column beside it from `lg`. Values are final in the DOM;
 * `CountUp` animates them in when motion is allowed.
 */
export function TestimonialStats(): ReactNode {
    return (
        <section aria-label={testimonial.sectionLabel} className="bg-background">
            <Container className="grid items-center gap-15 py-section lg:grid-cols-[minmax(0,37.5rem)_25rem] lg:justify-between lg:gap-12">
                <Reveal>
                    <figure>
                        <Image src="/icons/quote.svg" alt="" width={24} height={22} />
                        <blockquote className="mt-4 font-display text-quote text-foreground">
                            <p>{testimonial.quote}</p>
                        </blockquote>
                        <figcaption className="mt-8 flex items-center gap-4">
                            <Image
                                src={testimonial.avatar.src}
                                alt={testimonial.avatar.alt}
                                width={48}
                                height={48}
                                sizes="48px"
                                className="size-12 rounded-full bg-secondary object-cover"
                            />
                            <span className="flex flex-col">
                                <span className="text-subtitle-2 font-bold text-foreground">
                                    {testimonial.name}
                                </span>
                                <span className="text-body text-muted-foreground">
                                    {testimonial.role}
                                </span>
                            </span>
                        </figcaption>
                    </figure>
                </Reveal>

                {/* Three gapless columns as in the mobile frame; under 384 px the h1-sized values no
                    longer fit their column, so they step down to the h2 size. */}
                <Reveal delay={0.1}>
                    <dl className="grid grid-cols-3 lg:grid-cols-1 lg:gap-4.25 lg:border-l lg:border-border lg:pl-12">
                        {stats.map((stat) => (
                            <div key={stat.label} className="flex flex-col-reverse justify-end">
                                <dt className="mt-1 text-body text-subtle-foreground">
                                    {stat.label}
                                </dt>
                                <dd className="font-display text-h1 text-primary max-[24rem]:text-h2">
                                    <CountUp value={stat.value} />
                                </dd>
                            </div>
                        ))}
                    </dl>
                </Reveal>
            </Container>
        </section>
    );
}
