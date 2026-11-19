import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { featuredCourse } from "@/content/home";
import { sectionIds } from "@/content/site";

/** Blue band: course image (above on mobile) and course details. */
export function FeaturedCourse(): ReactNode {
    return (
        <section
            id={sectionIds.featured}
            aria-labelledby="featured-course-title"
            className="bg-primary text-on-dark focus-ring-inverse"
        >
            <Container className="grid items-center gap-12 py-section lg:grid-cols-2 lg:gap-15">
                <div className="relative">
                    <div className="relative aspect-[538/408] overflow-hidden rounded-xl bg-secondary">
                        <Image
                            src={featuredCourse.image.src}
                            alt={featuredCourse.image.alt}
                            fill
                            sizes="(min-width: 70rem) 538px, (min-width: 64rem) 50vw, calc(100vw - 2.5rem)"
                            className="object-cover"
                        />
                    </div>
                    <Badge className="absolute -top-3 -left-3">{featuredCourse.tag}</Badge>
                </div>

                <div className="flex flex-col items-start">
                    <SectionHeading
                        titleId="featured-course-title"
                        tone="on-dark"
                        eyebrow={featuredCourse.eyebrow}
                        title={featuredCourse.title}
                    />
                    <p className="mt-5 text-subtitle-2">{featuredCourse.description}</p>
                    <p className="mt-6 text-subtitle-2">{featuredCourse.instructor}</p>

                    <ul className="mt-6 flex flex-wrap gap-3">
                        {featuredCourse.details.map((detail) => (
                            <li key={detail}>
                                <Badge variant="outline">{detail}</Badge>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                        <Button asChild variant="accent">
                            <a href={featuredCourse.primary.href}>{featuredCourse.primary.label}</a>
                        </Button>
                        {/* White, not the design's #e7e7ec: that is 4.46:1 on the blue, under AA. */}
                        <Button asChild variant="link" className="px-4 text-on-dark">
                            <a href={featuredCourse.secondary.href}>
                                {featuredCourse.secondary.label}
                                <Image src="/icons/arrow-light.svg" alt="" width={20} height={20} />
                            </a>
                        </Button>
                    </div>
                </div>
            </Container>
        </section>
    );
}
