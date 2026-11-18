import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

describe("Card", () => {
    it("composes header, title, description, content and footer", () => {
        render(
            <Card data-testid="card">
                <CardHeader>
                    <CardTitle>Product Design</CardTitle>
                    <CardDescription>Turn complex problems into clear experiences.</CardDescription>
                </CardHeader>
                <CardContent>Body</CardContent>
                <CardFooter>Explore</CardFooter>
            </Card>,
        );

        expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card");
        expect(screen.getByRole("heading", { level: 3, name: "Product Design" })).toHaveAttribute(
            "data-slot",
            "card-title",
        );
        expect(screen.getByText(/Turn complex problems/)).toHaveAttribute(
            "data-slot",
            "card-description",
        );
        expect(screen.getByText("Body")).toHaveAttribute("data-slot", "card-content");
        expect(screen.getByText("Explore")).toHaveAttribute("data-slot", "card-footer");
    });

    it("merges a custom className", () => {
        render(<Card data-testid="card" className="p-10" />);

        const card = screen.getByTestId("card");
        expect(card).toHaveClass("p-10", "rounded-xl");
        expect(card).not.toHaveClass("p-7");
    });

    it("renders a link card through asChild, keeping it focusable", () => {
        render(
            <Card asChild>
                <a href="#courses">Technology</a>
            </Card>,
        );

        const link = screen.getByRole("link", { name: "Technology" });
        expect(link).toHaveAttribute("data-slot", "card");
        link.focus();
        expect(link).toHaveFocus();
    });

    it("lets the title render a different heading level", () => {
        render(
            <CardTitle asChild>
                <h2>Contact us</h2>
            </CardTitle>,
        );

        expect(screen.getByRole("heading", { level: 2, name: "Contact us" })).toHaveClass(
            "text-h5",
        );
    });

    it("forwards its ref", () => {
        const ref = createRef<HTMLDivElement>();
        render(<Card ref={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
});
