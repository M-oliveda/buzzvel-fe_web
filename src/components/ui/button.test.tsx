import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";

import { Button, buttonVariants } from "./button";

describe("Button", () => {
    it("renders a native button that does not submit forms by default", () => {
        render(<Button>Start learning</Button>);

        const button = screen.getByRole("button", { name: "Start learning" });
        expect(button).toHaveAttribute("type", "button");
        expect(button).toHaveAttribute("data-slot", "button");
    });

    it("keeps an explicit submit type", () => {
        render(<Button type="submit">Send message</Button>);

        expect(screen.getByRole("button", { name: "Send message" })).toHaveAttribute(
            "type",
            "submit",
        );
    });

    it.each([
        ["default", "bg-primary"],
        ["secondary", "bg-secondary"],
        ["accent", "bg-accent"],
        ["outline", "border-border"],
        ["ghost", "text-muted-foreground"],
        ["link", "hover:underline"],
        ["nav", "font-normal"],
    ] as const)("applies the %s variant", (variant, expected) => {
        render(<Button variant={variant}>Label</Button>);

        expect(screen.getByRole("button")).toHaveClass(expected);
    });

    it.each([
        ["sm", "py-2.5"],
        ["default", "py-3.5"],
        ["lg", "py-4"],
        ["icon", "size-11"],
        ["inline", "p-0"],
    ] as const)("applies the %s size", (size, expected) => {
        render(
            <Button size={size} aria-label="Label">
                L
            </Button>,
        );

        expect(screen.getByRole("button")).toHaveClass(expected);
    });

    it("merges a custom className, letting it override conflicting utilities", () => {
        render(<Button className="px-4">Log in</Button>);

        const button = screen.getByRole("button");
        expect(button).toHaveClass("px-4");
        expect(button).not.toHaveClass("px-7");
    });

    it("renders its child as the element when asChild is set", () => {
        render(
            <Button asChild variant="outline">
                <a href="#how-it-works">See how it works</a>
            </Button>,
        );

        const link = screen.getByRole("link", { name: "See how it works" });
        expect(link).toHaveAttribute("href", "#how-it-works");
        expect(link).toHaveAttribute("data-slot", "button");
        expect(link).toHaveClass("border-border");
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("forwards its ref to the DOM element", () => {
        const ref = createRef<HTMLButtonElement>();
        render(<Button ref={ref}>Label</Button>);

        expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    it("is reachable with the keyboard and fires on Enter", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(<Button onClick={onClick}>Label</Button>);

        await user.tab();
        expect(screen.getByRole("button")).toHaveFocus();

        await user.keyboard("{Enter}");
        expect(onClick).toHaveBeenCalledOnce();
    });

    it("ignores clicks and leaves the tab order when disabled", async () => {
        const user = userEvent.setup();
        const onClick = vi.fn();
        render(
            <Button disabled onClick={onClick}>
                Label
            </Button>,
        );

        const button = screen.getByRole("button");
        expect(button).toBeDisabled();

        await user.tab();
        expect(button).not.toHaveFocus();

        await user.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("exposes its variant classes for non-button elements", () => {
        expect(buttonVariants({ variant: "accent", size: "sm" })).toContain("bg-accent");
    });
});
