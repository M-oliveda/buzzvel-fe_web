import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { Container } from "./container";
import { Eyebrow } from "./eyebrow";
import { SectionHeading } from "./section-heading";

describe("Eyebrow", () => {
    it("renders overline text in the primary tone by default", () => {
        render(<Eyebrow>Learn at your own pace</Eyebrow>);

        const eyebrow = screen.getByText("Learn at your own pace");
        expect(eyebrow.tagName).toBe("P");
        expect(eyebrow).toHaveAttribute("data-slot", "eyebrow");
        expect(eyebrow).toHaveClass("text-overline", "uppercase", "text-primary");
    });

    it.each([
        ["muted", "text-subtle-foreground"],
        ["on-dark", "text-on-dark"],
    ] as const)("applies the %s tone", (tone, expected) => {
        render(<Eyebrow tone={tone}>Step 01</Eyebrow>);

        expect(screen.getByText("Step 01")).toHaveClass(expected);
    });

    it("renders its child when asChild is set", () => {
        render(
            <Eyebrow asChild>
                <span>Contact</span>
            </Eyebrow>,
        );

        expect(screen.getByText("Contact").tagName).toBe("SPAN");
        expect(screen.getByText("Contact")).toHaveClass("text-overline");
    });

    it("forwards its ref", () => {
        const ref = createRef<HTMLParagraphElement>();
        render(<Eyebrow ref={ref}>Contact</Eyebrow>);

        expect(ref.current).toBeInstanceOf(HTMLParagraphElement);
    });
});

describe("Container", () => {
    it("centres content inside the gutter", () => {
        render(<Container data-testid="container" className="py-section" />);

        const container = screen.getByTestId("container");
        expect(container).toHaveAttribute("data-slot", "container");
        expect(container).toHaveClass("mx-auto", "max-w-content", "px-gutter", "py-section");
    });

    it("renders its child when asChild is set", () => {
        render(
            <Container asChild>
                <section aria-label="Hero" />
            </Container>,
        );

        expect(screen.getByRole("region", { name: "Hero" })).toHaveClass("max-w-content");
    });

    it("forwards its ref", () => {
        const ref = createRef<HTMLDivElement>();
        render(<Container ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
});

describe("SectionHeading", () => {
    it("renders the eyebrow, a level-two heading and the description", () => {
        render(
            <SectionHeading
                eyebrow="Find your next skill"
                title="Learn something worth knowing."
                description="Short, practical courses."
                titleId="categories-title"
            />,
        );

        const heading = screen.getByRole("heading", {
            level: 2,
            name: "Learn something worth knowing.",
        });
        expect(heading).toHaveAttribute("id", "categories-title");
        expect(heading).toHaveClass("text-h3");
        expect(screen.getByText("Find your next skill")).toHaveClass("text-primary");
        expect(screen.getByText("Short, practical courses.")).toHaveClass("text-muted-foreground");
    });

    it("supports centred, large and on-dark headings without optional parts", () => {
        render(<SectionHeading title="What will you learn next?" align="center" size="lg" />);

        const heading = screen.getByRole("heading", { level: 2 });
        expect(heading).toHaveClass("text-h2", "mt-0");
        expect(heading.parentElement).toHaveClass("items-center", "text-center");
    });

    it("supports the loose spacing and a description class override", () => {
        render(
            <SectionHeading
                spacing="loose"
                eyebrow="The people"
                title="Meet international students & teachers"
                description="Morbi sit egestas."
                descriptionClassName="max-lg:text-body"
            />,
        );

        expect(screen.getByRole("heading", { level: 2 })).toHaveClass("mt-2");
        expect(screen.getByText("Morbi sit egestas.")).toHaveClass(
            "mt-6",
            "lg:mt-8",
            "max-lg:text-body",
        );
    });

    it("switches every part to the on-dark tone", () => {
        render(
            <SectionHeading
                tone="on-dark"
                eyebrow="Most popular this month"
                title="Designing products people understand."
                description="Learn how to turn complex workflows into simple experiences."
            />,
        );

        expect(screen.getByText("Most popular this month")).toHaveClass("text-on-dark");
        expect(screen.getByText(/Learn how to turn/)).toHaveClass("text-on-dark");
        expect(screen.getByRole("heading", { level: 2 }).parentElement).toHaveClass("text-on-dark");
    });
});
