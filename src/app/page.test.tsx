import { render, screen } from "@testing-library/react";

import { categories } from "@/content/categories";
import { contact, cta, featuredCourse, hero, people, testimonial } from "@/content/home";
import { steps } from "@/content/steps";

import HomePage from "./page";

describe("HomePage", () => {
    it("renders the banner, main and contentinfo landmarks", () => {
        render(<HomePage />);

        expect(screen.getByRole("banner")).toBeInTheDocument();
        expect(screen.getByRole("main")).toBeInTheDocument();
        expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    });

    it("renders the main landmark as the skip-link target", () => {
        render(<HomePage />);

        expect(screen.getByRole("main")).toHaveAttribute("id", "main");
    });

    it("renders exactly one level-one heading, from the hero", () => {
        render(<HomePage />);

        const headings = screen.getAllByRole("heading", { level: 1 });
        expect(headings).toHaveLength(1);
        expect(headings[0]).toHaveTextContent(hero.title);
    });

    it("renders every section in the MASTERPLAN §6.1 order", () => {
        render(<HomePage />);

        const names = screen
            .getAllByRole("region")
            .map((region) => region.getAttribute("aria-label") ?? region.textContent);
        const expected = [
            hero.title,
            categories.title,
            featuredCourse.title,
            steps.title,
            testimonial.sectionLabel,
            people.title,
            contact.title,
            cta.title,
        ];

        expect(screen.getAllByRole("region")).toHaveLength(expected.length);
        expected.forEach((name, index) => {
            expect(names[index]).toContain(name);
        });
    });
});
