import { render, screen } from "@testing-library/react";

import type { ContentImage } from "@/types/content";

import { AvatarStack } from "./avatar-stack";

const avatars: ContentImage[] = [
    { src: "/a.jpg", alt: "Ada", width: 80, height: 80 },
    { src: "/b.jpg", alt: "Grace", width: 80, height: 80 },
];

describe("AvatarStack", () => {
    it("renders one image per avatar with its alt text", () => {
        render(<AvatarStack avatars={avatars} data-testid="stack" />);

        expect(screen.getByTestId("stack")).toHaveAttribute("data-slot", "avatar-stack");
        expect(screen.getByRole("img", { name: "Ada" })).toBeInTheDocument();
        expect(screen.getByRole("img", { name: "Grace" })).toBeInTheDocument();
    });

    it("uses the small muted variant by default", () => {
        render(<AvatarStack avatars={avatars} />);

        const avatar = screen.getByRole("img", { name: "Ada" }).parentElement;
        expect(avatar).toHaveClass("size-8", "border-muted");
        expect(screen.getByRole("img", { name: "Ada" })).toHaveAttribute("width", "32");
    });

    it("supports the medium accent variant", () => {
        render(<AvatarStack avatars={avatars} size="md" ring="accent" className="mt-2" />);

        const avatar = screen.getByRole("img", { name: "Grace" }).parentElement;
        expect(avatar).toHaveClass("size-10", "border-accent");
        expect(avatar?.parentElement).toHaveClass("flex", "mt-2");
    });
});
