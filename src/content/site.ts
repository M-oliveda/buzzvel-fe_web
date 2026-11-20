export type NavLink = {
    label: string;
    href: string;
};

export type SiteContent = {
    name: string;
    title: string;
    description: string;
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
    /** Copy for the 404 page (`app/not-found.tsx`) and the error boundary (`app/error.tsx`). */
    statusPages: {
        notFound: StatusPageContent;
        error: StatusPageContent & { retry: string; reference: string };
    };
};

export type StatusPageContent = {
    eyebrow: string;
    title: string;
    description: string;
    home: NavLink;
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
    statusPages: {
        notFound: {
            eyebrow: "Error 404",
            title: "We could not find that page",
            description:
                "The link may be broken or the page may have moved. Everything Luma offers starts on the home page.",
            home: { label: "Back to the home page", href: "/" },
        },
        error: {
            eyebrow: "Something went wrong",
            title: "This page did not load properly",
            description:
                "It is probably a temporary problem on our side. Try again, or go back to the home page.",
            retry: "Try again",
            home: { label: "Back to the home page", href: "/" },
            reference: "Reference",
        },
    },
};
