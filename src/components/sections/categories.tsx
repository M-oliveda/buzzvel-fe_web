import Image from "next/image";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { categories } from "@/content/categories";
import { sectionIds } from "@/content/site";

/** Four numbered category link cards: 1 column, 2 from `md`, 4 from `lg` (MASTERPLAN §10.4). */
export function Categories(): ReactNode {
    return (
        <section
            id={sectionIds.courses}
            aria-labelledby="categories-title"
            className="bg-background"
        >
            <Container className="py-section">
                <SectionHeading
                    titleId="categories-title"
                    eyebrow={categories.eyebrow}
                    title={categories.title}
                    description={categories.description}
                    className="max-w-140"
                />

                <ul className="mt-12 grid gap-4 md:grid-cols-2 md:gap-5 lg:mt-10 lg:grid-cols-4">
                    {categories.items.map((category) => (
                        <li key={category.number} className="flex">
                            <Card
                                asChild
                                className="group w-full justify-between pb-5 transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-card focus-visible:-translate-y-1 focus-visible:shadow-card lg:min-h-65 lg:pb-7"
                            >
                                <a href={category.href}>
                                    <span className="flex flex-col">
                                        <Badge variant="secondary">{category.number}</Badge>
                                        <CardTitle className="mt-5">{category.title}</CardTitle>
                                        <CardDescription className="mt-3 text-subtle-foreground">
                                            {category.description}
                                        </CardDescription>
                                    </span>
                                    <span className="flex items-center gap-2 text-body font-bold text-foreground">
                                        {categories.cta}
                                        <Image
                                            src="/icons/arrow-dark.svg"
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                                        />
                                    </span>
                                </a>
                            </Card>
                        </li>
                    ))}
                </ul>
            </Container>
        </section>
    );
}
