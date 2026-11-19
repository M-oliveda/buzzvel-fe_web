// @vitest-environment node
import { z } from "zod";

import { contact } from "@/content/home";

import { contactSchema } from "./contact.schema";

const { errors } = contact.form;

const valid = {
    name: "Ada Lovelace",
    email: "ada@example.com",
    message: "Which course should I start with?",
};

function fieldErrors(input: unknown): Record<string, string[] | undefined> {
    const result = contactSchema.safeParse(input);
    if (result.success) return {};
    return z.flattenError(result.error).fieldErrors;
}

describe("contactSchema", () => {
    it("runs Zod without JIT so the CSP never sees an eval probe", () => {
        expect(z.config().jitless).toBe(true);
    });

    it("accepts a complete message and trims the text fields", () => {
        const result = contactSchema.parse({
            ...valid,
            name: "  Ada Lovelace  ",
            message: `  ${valid.message}  `,
        });

        expect(result).toEqual(valid);
    });

    it("keeps the honeypot value so the route can detect bots", () => {
        expect(contactSchema.parse({ ...valid, website: "spam.example" }).website).toBe(
            "spam.example",
        );
    });

    it.each([
        ["name", " A ", errors.nameTooShort],
        ["name", "A".repeat(101), errors.nameTooLong],
        ["email", "not-an-email", errors.emailInvalid],
        ["email", `${"a".repeat(250)}@example.com`, errors.emailTooLong],
        ["message", "  too short ", errors.messageTooShort],
        ["message", "x".repeat(2001), errors.messageTooLong],
    ])("rejects an invalid %s with the content copy", (field, value, message) => {
        expect(fieldErrors({ ...valid, [field]: value })[field]).toContain(message);
    });

    it("reports every missing field", () => {
        expect(Object.keys(fieldErrors({})).sort()).toEqual(["email", "message", "name"]);
    });
});
