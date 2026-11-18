import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { site } from "@/content/site";

import { SkipLink } from "./skip-link";

describe("SkipLink", () => {
    it("is the first element reached with Tab and targets the main landmark", async () => {
        const user = userEvent.setup();
        render(
            <>
                <SkipLink />
                <a href="#courses">Courses</a>
            </>,
        );

        await user.tab();

        const link = screen.getByRole("link", { name: site.skipLink });
        expect(link).toHaveFocus();
        expect(link).toHaveAttribute("href", "#main");
        // Hidden until focused; the focus-visible utilities reveal it.
        expect(link).toHaveClass("sr-only", "focus-visible:not-sr-only");
    });
});
