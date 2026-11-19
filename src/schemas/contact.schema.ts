import { z } from "zod";

import { contact } from "@/content/home";

// No JIT: Zod otherwise probes `new Function`, which the CSP (no `'unsafe-eval'`) reports as a
// violation even though Zod catches it. The speed-up is irrelevant for a three-field form.
z.config({ jitless: true });

const { errors } = contact.form;

/** Largest JSON body the contact endpoint accepts; generous for 2,000 characters of text. */
export const CONTACT_MAX_BODY_BYTES = 16 * 1024;

/**
 * Contact form payload, validated with the same schema in the browser and in
 * `POST /api/v1/contact` (MASTERPLAN §11.3).
 */
export const contactSchema = z.object({
    name: z.string().trim().min(2, errors.nameTooShort).max(100, errors.nameTooLong),
    email: z.email(errors.emailInvalid).max(254, errors.emailTooLong),
    message: z.string().trim().min(10, errors.messageTooShort).max(2000, errors.messageTooLong),
    /** Honeypot: hidden from people, so any value means a bot. Checked by the route, not here. */
    website: z.string().optional(),
});

/** What the form holds before parsing. */
export type ContactInput = z.input<typeof contactSchema>;
/** What a successful parse returns (trimmed strings). */
export type ContactValues = z.output<typeof contactSchema>;

/** Field names that can carry a validation error back to the form. */
export type ContactField = "name" | "email" | "message";

export type ContactFieldErrors = Partial<Record<ContactField, string[]>>;

/** Response bodies of `POST /api/v1/contact`; shared by the route and the client. */
export type ContactResponseBody =
    | { status: "received"; id: string }
    | { error: "validation"; fieldErrors: ContactFieldErrors }
    | {
          error:
              | "invalid_json"
              | "payload_too_large"
              | "unsupported_media_type"
              | "rate_limited"
              | "internal";
      };
