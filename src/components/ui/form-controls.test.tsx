import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

describe("Label", () => {
    it("labels the control it points at", () => {
        render(
            <>
                <Label htmlFor="name">Full name</Label>
                <input id="name" />
            </>,
        );

        expect(screen.getByLabelText("Full name")).toHaveAttribute("id", "name");
        expect(screen.getByText("Full name")).toHaveAttribute("data-slot", "label");
    });
});

describe("Input", () => {
    it("renders a text input by default and accepts typing", async () => {
        const user = userEvent.setup();
        render(<Input aria-label="Full name" placeholder="Your name" />);

        const input = screen.getByRole("textbox", { name: "Full name" });
        expect(input).toHaveAttribute("type", "text");
        expect(input).toHaveAttribute("data-slot", "input");

        await user.type(input, "Ada");
        expect(input).toHaveValue("Ada");
    });

    it("keeps an explicit type", () => {
        render(<Input type="email" aria-label="Email" />);

        expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("type", "email");
    });

    it("is skipped by the keyboard when disabled", async () => {
        const user = userEvent.setup();
        render(<Input aria-label="Full name" disabled />);

        await user.tab();
        expect(screen.getByRole("textbox")).not.toHaveFocus();
        expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("styles the invalid state through aria-invalid", () => {
        render(<Input aria-label="Email" aria-invalid />);

        const input = screen.getByRole("textbox");
        expect(input).toBeInvalid();
        expect(input).toHaveClass("aria-invalid:border-destructive");
    });

    it("forwards its ref and merges className", () => {
        const ref = createRef<HTMLInputElement>();
        render(<Input ref={ref} aria-label="Name" className="h-14" />);

        expect(ref.current).toBeInstanceOf(HTMLInputElement);
        expect(ref.current).toHaveClass("h-14");
        expect(ref.current).not.toHaveClass("h-12");
    });
});

describe("Textarea", () => {
    it("renders a multi-line textbox that receives focus", async () => {
        const user = userEvent.setup();
        render(<Textarea aria-label="Your question" />);

        const textarea = screen.getByRole("textbox", { name: "Your question" });
        expect(textarea.tagName).toBe("TEXTAREA");
        expect(textarea).toHaveAttribute("data-slot", "textarea");

        await user.tab();
        expect(textarea).toHaveFocus();
    });

    it("forwards its ref and supports disabled", () => {
        const ref = createRef<HTMLTextAreaElement>();
        render(<Textarea ref={ref} aria-label="Question" disabled />);

        expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
        expect(ref.current).toBeDisabled();
    });
});
