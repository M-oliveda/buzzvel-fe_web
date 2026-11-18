import { render, screen } from "@testing-library/react";

import { site } from "@/content/site";

import HomePage from "./page";

describe("HomePage", () => {
    it("renders the main landmark as the skip-link target", () => {
        render(<HomePage />);

        expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    });

    it("renders exactly one level-one heading", () => {
        render(<HomePage />);

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(
            screen.getByRole("heading", { level: 1, name: site.placeholder.heading }),
        ).toBeVisible();
    });
});
