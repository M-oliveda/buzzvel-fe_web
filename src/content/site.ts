export type NavLink = {
    label: string;
    href: string;
};

export type SiteContent = {
    name: string;
    title: string;
    description: string;
    placeholder: {
        heading: string;
        body: string;
    };
    /** Browser UI colour; the cream page surface (`--muted` in globals.css). */
    themeColor: string;
    logo: {
        src: string;
        /** Light variant for the navy footer. */
        srcOnDark: string;
        width: number;
        height: number;
        /** Accessible name of the logo link. */
        label: string;
    };
    skipLink: string;
    nav: {
        label: string;
        links: readonly NavLink[];
    };
    actions: {
        login: NavLink;
        primary: NavLink;
    };
    /** Name of the mobile menu button; `aria-expanded` conveys whether it is open. */
    menuLabel: string;
};

// Section anchors the header links scroll to; each section sets the matching id.
export const sectionIds = {
    courses: "courses",
    featured: "featured-course",
    howItWorks: "how-it-works",
    community: "community",
    contact: "contact",
} as const;

export const site: SiteContent = {
    name: "Luma",
    title: "Luma — Build skills that actually move you forward",
    description:
        "Expert-led online courses in product design, technology, business and creative skills.",
    placeholder: {
        heading: "Build skills that actually move you forward.",
        body: "The Luma landing page is under construction.",
    },
    themeColor: "#f9f8f3",
    logo: {
        src: "/icons/logo.svg",
        srcOnDark: "/icons/logo-light.svg",
        width: 54,
        height: 17,
        label: "Luma home",
    },
    skipLink: "Skip to main content",
    nav: {
        label: "Main",
        links: [
            { label: "Courses", href: `#${sectionIds.courses}` },
            { label: "For Teams", href: `#${sectionIds.contact}` },
            { label: "Community", href: `#${sectionIds.community}` },
            { label: "About", href: `#${sectionIds.howItWorks}` },
        ],
    },
    actions: {
        login: { label: "Log in", href: `#${sectionIds.contact}` },
        primary: { label: "Start learning", href: `#${sectionIds.courses}` },
    },
    menuLabel: "Menu",
};
