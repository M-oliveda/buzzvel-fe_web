import { sectionIds, type NavLink } from "./site";

export type FooterColumn = {
    title: string;
    links: readonly NavLink[];
};

export type FooterContent = {
    tagline: string;
    columns: readonly FooterColumn[];
    copyright: string;
};

// Pages that do not exist in this single-page mock point at the top of the page ("#").
export const footer: FooterContent = {
    tagline: "Practical learning for curious people.",
    columns: [
        {
            title: "Explore",
            links: [
                { label: "Courses", href: `#${sectionIds.featured}` },
                { label: "Categories", href: `#${sectionIds.courses}` },
                { label: "Instructors", href: `#${sectionIds.community}` },
                { label: "For Teams", href: `#${sectionIds.contact}` },
            ],
        },
        {
            title: "Company",
            links: [
                { label: "About", href: `#${sectionIds.howItWorks}` },
                { label: "Careers", href: "#" },
                { label: "Journal", href: "#" },
            ],
        },
        {
            title: "Support",
            links: [
                { label: "Help Center", href: `#${sectionIds.contact}` },
                { label: "Contact", href: `#${sectionIds.contact}` },
                { label: "Terms", href: "#" },
                { label: "Privacy", href: "#" },
            ],
        },
    ],
    copyright: "© 2026 Luma Learning",
};
