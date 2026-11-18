import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { Badge } from "./badge";

describe("Badge", () => {
    it("renders a span with the default (accent) variant", () => {
        render(<Badge>Featured course</Badge>);

        const badge = screen.getByText("Featured course");
        expect(badge.tagName).toBe("SPAN");
        expect(badge).toHaveAttribute("data-slot", "badge");
        expect(badge).toHaveClass("bg-accent", "uppercase");
    });

    it.each([
        ["secondary", "bg-secondary"],
        ["outline", "border-border"],
    ] as const)("applies the %s variant", (variant, expected) => {
        render(<Badge variant={variant}>8 lessons</Badge>);

        expect(screen.getByText("8 lessons")).toHaveClass(expected);
    });

    it("merges a custom className", () => {
        render(<Badge className="text-on-dark">2h 40min</Badge>);

        expect(screen.getByText("2h 40min")).toHaveClass("text-on-dark");
    });

    it("renders its child when asChild is set", () => {
        render(
            <Badge asChild variant="secondary">
                <strong>01</strong>
            </Badge>,
        );

        const badge = screen.getByText("01");
        expect(badge.tagName).toBe("STRONG");
        expect(badge).toHaveClass("bg-secondary");
    });

    it("forwards its ref", () => {
        const ref = createRef<HTMLSpanElement>();
        render(<Badge ref={ref}>Intermediate</Badge>);

        expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    });
});
