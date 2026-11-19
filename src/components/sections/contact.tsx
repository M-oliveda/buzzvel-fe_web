import Image from "next/image";
import type { ReactNode } from "react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { contact } from "@/content/home";
import { sectionIds } from "@/content/site";

import { ContactForm } from "./contact-form";

/**
 * Contact info cards and the contact form (form below info on mobile). The section stays a
 * Server Component; only `ContactForm` is a client island.
 */
export function Contact(): ReactNode {
    const { form } = contact;

    return (
        <section id={sectionIds.contact} aria-labelledby="contact-title" className="bg-background">
            <Container className="grid items-center gap-10 py-section lg:grid-cols-[minmax(0,30rem)_minmax(0,33.75rem)] lg:justify-between lg:gap-12">
                <Reveal>
                    <SectionHeading
                        titleId="contact-title"
                        eyebrow={contact.eyebrow}
                        title={contact.title}
                        description={contact.description}
                        descriptionClassName="max-lg:text-body"
                    />
                    <ul className="mt-10 flex flex-col gap-4">
                        {contact.channels.map((channel) => (
                            <li
                                key={channel.title}
                                className="flex items-center gap-4 rounded-lg bg-muted p-4 lg:p-5"
                            >
                                <span className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary">
                                    <Image
                                        src={channel.icon.src}
                                        alt=""
                                        width={channel.icon.width}
                                        height={channel.icon.height}
                                    />
                                </span>
                                <span className="flex flex-col gap-1 text-body">
                                    <span className="text-foreground">{channel.title}</span>
                                    {channel.href ? (
                                        <Button
                                            asChild
                                            variant="link"
                                            size="inline"
                                            className="w-fit font-normal text-primary"
                                        >
                                            <a href={channel.href}>{channel.detail}</a>
                                        </Button>
                                    ) : (
                                        // muted-foreground, not the design's tertiary text: the
                                        // tertiary colour is under 4.5:1 on the cream card.
                                        <span className="text-muted-foreground">
                                            {channel.detail}
                                        </span>
                                    )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </Reveal>

                <Reveal delay={0.1}>
                    <Card className="gap-6 p-5 shadow-card sm:p-10">
                        <CardHeader>
                            <CardTitle id="contact-form-title">{form.title}</CardTitle>
                            <CardDescription>{form.description}</CardDescription>
                        </CardHeader>
                        <ContactForm labelledBy="contact-form-title" />
                    </Card>
                </Reveal>
            </Container>
        </section>
    );
}
