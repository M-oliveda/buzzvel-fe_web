export type SiteContent = {
    name: string;
    title: string;
    description: string;
    placeholder: {
        heading: string;
        body: string;
    };
};

export const site: SiteContent = {
    name: "Luma",
    title: "Luma — Build skills that actually move you forward",
    description:
        "Expert-led online courses in product design, technology, business and creative skills.",
    placeholder: {
        heading: "Build skills that actually move you forward.",
        body: "The Luma landing page is under construction.",
    },
};
