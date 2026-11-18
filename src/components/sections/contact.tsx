import Image from "next/image";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Textarea } from "@/components/ui/textarea";
import { contact } from "@/content/home";
import { sectionIds } from "@/content/site";

/**
 * Contact info cards and the contact form (form below info on mobile). Static in Phase 3:
 * validation, submission, the honeypot and success/error states arrive with the client form
 * in Phase 4 (MASTERPLAN §10.5).
 */
export function Contact(): ReactNode {
    const { form } = contact;

    return (
        <section id={sectionIds.contact} aria-labelledby="contact-title" className="bg-background">
            <Container className="grid items-center gap-10 py-section lg:grid-cols-[minmax(0,30rem)_minmax(0,33.75rem)] lg:justify-between lg:gap-12">
                <div>
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
                </div>

                <Card className="gap-6 p-5 shadow-card sm:p-10">
                    <CardHeader>
                        <CardTitle id="contact-form-title">{form.title}</CardTitle>
                        <CardDescription>{form.description}</CardDescription>
                    </CardHeader>
                    <form
                        aria-labelledby="contact-form-title"
                        noValidate
                        className="flex flex-col gap-6"
                    >
                        <div className="flex flex-col gap-5">
                            <Field id="contact-name" label={form.fields.name.label}>
                                {(control) => (
                                    <Input
                                        {...control}
                                        name="name"
                                        autoComplete="name"
                                        placeholder={form.fields.name.placeholder}
                                    />
                                )}
                            </Field>
                            <Field id="contact-email" label={form.fields.email.label}>
                                {(control) => (
                                    <Input
                                        {...control}
                                        type="email"
                                        name="email"
                                        autoComplete="email"
                                        placeholder={form.fields.email.placeholder}
                                    />
                                )}
                            </Field>
                            <Field id="contact-message" label={form.fields.message.label}>
                                {(control) => (
                                    <Textarea
                                        {...control}
                                        name="message"
                                        // 100 px on the mobile frame, 120 px on desktop.
                                        className="max-lg:min-h-25"
                                        placeholder={form.fields.message.placeholder}
                                    />
                                )}
                            </Field>
                        </div>
                        <Button type="submit" className="w-full">
                            {form.submit}
                        </Button>
                    </form>
                </Card>
            </Container>
        </section>
    );
}
