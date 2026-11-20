import { sectionIds } from "./site";

export type Category = {
    /** Two-digit index shown on the card ("01"). */
    number: string;
    title: string;
    description: string;
    href: string;
};

export type CategoriesContent = {
    eyebrow: string;
    title: string;
    description: string;
    cta: string;
    items: readonly Category[];
};

export const categories: CategoriesContent = {
    eyebrow: "Find your next skill",
    title: "Learn something worth knowing.",
    description: "Short, practical courses designed around skills you can put to work immediately.",
    cta: "Explore",
    items: [
        {
            number: "01",
            title: "Product Design",
            description: "Turn complex problems into clear, useful experiences.",
            href: `#${sectionIds.featured}`,
        },
        {
            number: "02",
            title: "Technology",
            description: "Build a stronger understanding of the tools shaping digital products.",
            href: `#${sectionIds.featured}`,
        },
        {
            number: "03",
            title: "Business",
            description: "Develop practical skills for better decisions and stronger teams.",
            href: `#${sectionIds.featured}`,
        },
        {
            number: "04",
            title: "Creative",
            description: "Explore new ways to communicate, create and tell stories.",
            href: `#${sectionIds.featured}`,
        },
    ],
};
