import { render, screen, within } from "@testing-library/react";

import { categories } from "@/content/categories";
import { contact, cta, featuredCourse, hero, people, testimonial } from "@/content/home";
import { sectionIds } from "@/content/site";
import { stats } from "@/content/stats";
import { steps } from "@/content/steps";

import { Categories } from "./categories";
import { Contact } from "./contact";
import { CtaBand } from "./cta-band";
import { FeaturedCourse } from "./featured-course";
import { Hero } from "./hero";
import { HowItWorks } from "./how-it-works";
import { People } from "./people";
import { TestimonialStats } from "./testimonial-stats";

describe("Hero", () => {
    it("renders the page title as the only level-one heading", () => {
        render(<Hero />);

        expect(screen.getByRole("region", { name: hero.title })).toBeInTheDocument();
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(screen.getByText(hero.description)).toBeVisible();
    });

    it("links both calls to action to their sections", () => {
        render(<Hero />);

        expect(screen.getByRole("link", { name: hero.primary.label })).toHaveAttribute(
            "href",
            hero.primary.href,
        );
        expect(screen.getByRole("link", { name: hero.secondary.label })).toHaveAttribute(
            "href",
            hero.secondary.href,
        );
    });

    it("describes the hero photo and keeps the trust and rating copy", () => {
        render(<Hero />);

        expect(screen.getByRole("img", { name: hero.image.alt })).toBeInTheDocument();
        expect(screen.getByText(hero.trust.highlight)).toBeVisible();
        expect(screen.getByText(hero.coursesChip.label)).toBeVisible();
        expect(screen.getByText(hero.ratingChip.label)).toBeVisible();
    });
});

describe("Categories", () => {
    it("renders the section heading and one link card per category", () => {
        render(<Categories />);

        const section = screen.getByRole("region", { name: categories.title });
        expect(section).toHaveAttribute("id", sectionIds.courses);

        const cards = within(section).getAllByRole("link");
        expect(cards).toHaveLength(categories.items.length);
        for (const category of categories.items) {
            const card = within(section).getByRole("link", {
                name: new RegExp(category.title),
            });
            expect(card).toHaveAttribute("href", category.href);
            expect(
                within(card).getByRole("heading", { level: 3, name: category.title }),
            ).toBeInTheDocument();
            expect(within(card).getByText(category.number)).toBeInTheDocument();
        }
    });
});

describe("FeaturedCourse", () => {
    it("renders the course details, tag and actions", () => {
        render(<FeaturedCourse />);

        const section = screen.getByRole("region", { name: featuredCourse.title });
        expect(section).toHaveAttribute("id", sectionIds.featured);
        expect(within(section).getByText(featuredCourse.tag)).toBeVisible();
        expect(within(section).getByText(featuredCourse.instructor)).toBeVisible();
        expect(
            within(section).getByRole("img", { name: featuredCourse.image.alt }),
        ).toBeInTheDocument();

        const details = within(section).getByRole("list");
        expect(
            within(details)
                .getAllByRole("listitem")
                .map((item) => item.textContent),
        ).toEqual(featuredCourse.details);

        expect(
            within(section).getByRole("link", { name: featuredCourse.primary.label }),
        ).toHaveAttribute("href", featuredCourse.primary.href);
        expect(
            within(section).getByRole("link", { name: featuredCourse.secondary.label }),
        ).toHaveAttribute("href", featuredCourse.secondary.href);
    });
});

describe("HowItWorks", () => {
    it("renders the steps as an ordered list numbered 01 to 03", () => {
        render(<HowItWorks />);

        const section = screen.getByRole("region", { name: steps.title });
        expect(section).toHaveAttribute("id", sectionIds.howItWorks);

        const items = within(within(section).getByRole("list")).getAllByRole("listitem");
        expect(items).toHaveLength(3);
        steps.items.forEach((step, index) => {
            const item = items[index];
            if (!item) throw new Error(`Missing step ${index}`);
            expect(within(item).getByText(step.label)).toBeVisible();
            expect(within(item).getByRole("heading", { level: 3, name: step.title })).toBeVisible();
            expect(within(item).getByText(step.description)).toBeVisible();
        });
    });
});

describe("TestimonialStats", () => {
    it("renders the quote with its attribution", () => {
        render(<TestimonialStats />);

        const section = screen.getByRole("region", { name: testimonial.sectionLabel });
        const figure = within(section).getByRole("figure");
        expect(within(figure).getByText(testimonial.quote)).toBeVisible();
        expect(within(figure).getByText(testimonial.name)).toBeVisible();
        expect(within(figure).getByText(testimonial.role)).toBeVisible();
    });

    it("renders every final stat value in the DOM with its label", () => {
        render(<TestimonialStats />);

        const terms = screen.getAllByRole("term").map((term) => term.textContent);
        const values = screen.getAllByRole("definition").map((value) => value.textContent);
        expect(terms).toEqual(stats.map((stat) => stat.label));
        expect(values).toEqual(stats.map((stat) => stat.value));
    });
});

describe("People", () => {
    it("renders the copy, the call to action and a labelled collage", () => {
        render(<People />);

        const section = screen.getByRole("region", { name: people.title });
        expect(section).toHaveAttribute("id", sectionIds.community);
        expect(within(section).getByText(people.description)).toBeVisible();
        expect(within(section).getByRole("link", { name: people.cta.label })).toHaveAttribute(
            "href",
            people.cta.href,
        );

        const collage = within(section).getByRole("group", { name: people.collageLabel });
        const photos = people.columns.flatMap((column) => column.images);
        expect(within(collage).getAllByRole("img")).toHaveLength(photos.length);
        for (const photo of photos) {
            expect(within(collage).getByRole("img", { name: photo.alt })).toBeInTheDocument();
        }
    });
});

describe("Contact", () => {
    it("renders the contact channels with a mailto link", () => {
        render(<Contact />);

        const section = screen.getByRole("region", { name: contact.title });
        expect(section).toHaveAttribute("id", sectionIds.contact);

        const [email, response] = contact.channels;
        if (!email || !response) throw new Error("Contact channels missing");
        expect(within(section).getByRole("link", { name: email.detail })).toHaveAttribute(
            "href",
            email.href,
        );
        expect(within(section).getByText(response.detail)).toBeVisible();
    });

    it("renders a labelled form with associated fields and a submit button", () => {
        render(<Contact />);

        const form = screen.getByRole("form", { name: contact.form.title });
        const { fields } = contact.form;

        expect(within(form).getByRole("textbox", { name: fields.name.label })).toHaveAttribute(
            "autocomplete",
            "name",
        );
        expect(within(form).getByRole("textbox", { name: fields.email.label })).toHaveAttribute(
            "type",
            "email",
        );
        expect(within(form).getByRole("textbox", { name: fields.message.label }).tagName).toBe(
            "TEXTAREA",
        );
        expect(within(form).getByRole("button", { name: contact.form.submit })).toHaveAttribute(
            "type",
            "submit",
        );
    });
});

describe("CtaBand", () => {
    it("renders the closing heading, copy and both actions", () => {
        render(<CtaBand />);

        const section = screen.getByRole("region", { name: cta.title });
        expect(within(section).getByText(cta.description)).toBeVisible();
        expect(within(section).getByRole("link", { name: cta.primary.label })).toHaveAttribute(
            "href",
            cta.primary.href,
        );
        expect(within(section).getByRole("link", { name: cta.secondary.label })).toHaveAttribute(
            "href",
            cta.secondary.href,
        );
    });

    it("keeps every decorative shape out of the accessibility tree", () => {
        render(<CtaBand />);

        // Only the avatars are images, and they are decorative too.
        expect(screen.queryAllByRole("img")).toHaveLength(0);
    });
});
