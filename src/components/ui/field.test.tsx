import { render, screen } from "@testing-library/react";

import { Field } from "./field";
import { Input } from "./input";
import { Textarea } from "./textarea";

describe("Field", () => {
    it("associates the label with the control using a generated id", () => {
        render(<Field label="Full name">{(control) => <Input {...control} />}</Field>);

        const input = screen.getByRole("textbox", { name: "Full name" });
        expect(input.id).not.toBe("");
        expect(input).not.toHaveAttribute("aria-describedby");
        expect(input).not.toBeInvalid();
    });

    it("uses the given id", () => {
        render(
            <Field id="email" label="Email">
                {(control) => <Input type="email" {...control} />}
            </Field>,
        );

        expect(screen.getByLabelText("Email")).toHaveAttribute("id", "email");
    });

    it("describes the control with its description", () => {
        render(
            <Field id="question" label="Your question" description="Up to 2,000 characters.">
                {(control) => <Textarea {...control} />}
            </Field>,
        );

        expect(screen.getByRole("textbox", { name: "Your question" })).toHaveAccessibleDescription(
            "Up to 2,000 characters.",
        );
    });

    it("marks the control invalid and announces the error after the description", () => {
        render(
            <Field
                id="email"
                label="Email"
                description="We reply here."
                error="Enter a valid email."
            >
                {(control) => <Input type="email" {...control} />}
            </Field>,
        );

        const input = screen.getByRole("textbox", { name: "Email" });
        expect(input).toBeInvalid();
        expect(input).toHaveAttribute("aria-describedby", "email-description email-error");
        expect(input).toHaveAccessibleDescription("We reply here. Enter a valid email.");
        expect(screen.getByText("Enter a valid email.")).toHaveAttribute(
            "data-slot",
            "field-error",
        );
    });
});
