"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, type FormEvent, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contact } from "@/content/home";
import { CONTACT_ENDPOINT, submitContact, type ContactSubmitResult } from "@/lib/contact-client";
import {
    contactSchema,
    type ContactField,
    type ContactInput,
    type ContactValues,
} from "@/schemas/contact.schema";

const FIELD_ORDER: readonly ContactField[] = ["name", "email", "message"];

type Status = { kind: "idle" } | { kind: "success" } | { kind: "error"; message: string };

const failureMessages: Record<"rate_limited" | "server" | "network", string> = {
    rate_limited: contact.form.failure.rateLimited,
    server: contact.form.failure.server,
    network: contact.form.failure.network,
};

export type ContactFormProps = {
    /** Id of the heading that names the form. */
    labelledBy: string;
};

/**
 * Contact form island (MASTERPLAN §10.5): validates on blur and on submit with the API's Zod
 * schema, moves focus to the first invalid field, and reports success in a polite status region
 * and failures in an alert. While sending, the button is `aria-disabled` rather than `disabled`
 * so keyboard focus stays on it (owner decision); repeat submits are ignored.
 */
export function ContactForm({ labelledBy }: ContactFormProps): ReactNode {
    const { form } = contact;
    const [status, setStatus] = useState<Status>({ kind: "idle" });
    const pending = useRef(false);
    const {
        register,
        handleSubmit,
        setError,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactInput, unknown, ContactValues>({
        resolver: zodResolver(contactSchema),
        mode: "onTouched",
        defaultValues: { name: "", email: "", message: "", website: "" },
    });

    const applyResult = (result: ContactSubmitResult): void => {
        if (result.kind === "ok") {
            reset();
            setStatus({ kind: "success" });
            return;
        }

        if (result.kind === "validation") {
            const invalid = FIELD_ORDER.filter((field) => result.fieldErrors[field]?.[0]);
            invalid.forEach((field, index) => {
                setError(
                    field,
                    { type: "server", message: result.fieldErrors[field]?.[0] },
                    { shouldFocus: index === 0 },
                );
            });
            setStatus({ kind: "idle" });
            return;
        }

        setStatus({ kind: "error", message: failureMessages[result.kind] });
    };

    const onValid = async (values: ContactValues): Promise<void> => {
        pending.current = true;
        setStatus({ kind: "idle" });
        try {
            applyResult(await submitContact(values));
        } finally {
            pending.current = false;
        }
    };

    const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
        if (pending.current) {
            event.preventDefault();
            return;
        }
        void handleSubmit(onValid)(event);
    };

    return (
        <form
            // Before hydration the browser posts natively; the API then answers 415 (JSON only),
            // so nothing is sent or leaked into the URL. After hydration `onSubmit` takes over.
            method="post"
            action={CONTACT_ENDPOINT}
            aria-labelledby={labelledBy}
            noValidate
            onSubmit={onSubmit}
            className="flex flex-col gap-6"
        >
            <div className="flex flex-col gap-5">
                <Field
                    id="contact-name"
                    label={form.fields.name.label}
                    error={errors.name?.message}
                >
                    {(control) => (
                        <Input
                            {...control}
                            {...register("name")}
                            autoComplete="name"
                            placeholder={form.fields.name.placeholder}
                        />
                    )}
                </Field>
                <Field
                    id="contact-email"
                    label={form.fields.email.label}
                    error={errors.email?.message}
                >
                    {(control) => (
                        <Input
                            {...control}
                            {...register("email")}
                            type="email"
                            autoComplete="email"
                            placeholder={form.fields.email.placeholder}
                        />
                    )}
                </Field>
                <Field
                    id="contact-message"
                    label={form.fields.message.label}
                    error={errors.message?.message}
                >
                    {(control) => (
                        <Textarea
                            {...control}
                            {...register("message")}
                            // 100 px on the mobile frame, 120 px on desktop.
                            className="max-lg:min-h-25"
                            placeholder={form.fields.message.placeholder}
                        />
                    )}
                </Field>

                {/* Honeypot: invisible and unreachable for people, tempting for bots. */}
                <div aria-hidden="true" className="sr-only">
                    <Label htmlFor="contact-website">{form.honeypotLabel}</Label>
                    <Input
                        id="contact-website"
                        tabIndex={-1}
                        autoComplete="off"
                        {...register("website")}
                    />
                </div>
            </div>

            {status.kind === "error" ? (
                <p
                    role="alert"
                    className="rounded-md border border-destructive p-4 text-body text-destructive"
                >
                    {status.message}
                </p>
            ) : null}

            <Button type="submit" className="w-full" aria-disabled={isSubmitting || undefined}>
                {isSubmitting ? form.pending : form.submit}
            </Button>

            {/*
             * Always mounted so screen readers announce the message when it appears. While empty
             * it is `sr-only` (not `hidden`): still in the accessibility tree, and absolutely
             * positioned so it adds no flex gap.
             */}
            <p
                role="status"
                className="rounded-md bg-secondary p-4 text-body text-foreground empty:sr-only"
            >
                {status.kind === "success" ? form.success : null}
            </p>
        </form>
    );
}
