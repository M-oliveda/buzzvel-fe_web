import { sectionIds } from "./site";
import type { ContentImage, ContentLink } from "@/types/content";

// Copy for the landing-page sections that are not lists (lists live in their own files).

const learnerAvatars: readonly ContentImage[] = [1, 2, 3, 4].map((n) => ({
    src: `/images/avatars/learner-${n}.jpg`,
    // Decorative: the adjacent text ("Trusted by 24,000+ learners") carries the meaning.
    alt: "",
    width: 80,
    height: 80,
}));

export type HeroContent = {
    eyebrow: string;
    title: string;
    description: string;
    primary: ContentLink;
    secondary: ContentLink;
    trust: { avatars: readonly ContentImage[]; highlight: string; rest: string };
    image: ContentImage;
    coursesChip: { value: string; label: string };
    ratingChip: { label: string; stars: number };
};

export const hero: HeroContent = {
    eyebrow: "Learn at your own pace",
    title: "Build skills that actually move you forward.",
    description:
        "Practical courses taught by people who do the work every day. Learn design, technology, business and more — one focused lesson at a time.",
    primary: { label: "Explore courses", href: `#${sectionIds.courses}` },
    secondary: { label: "See how it works", href: `#${sectionIds.howItWorks}` },
    trust: {
        avatars: learnerAvatars.slice(0, 3),
        highlight: "Trusted by 24,000+",
        rest: "learners",
    },
    image: {
        src: "/images/hero-learner.jpg",
        alt: "Smiling learner with glasses working on a laptop",
        width: 900,
        height: 1100,
    },
    coursesChip: { value: "120+", label: "expert-led courses" },
    ratingChip: { label: "4.9 avg rating", stars: 5 },
};

export type FeaturedCourseContent = {
    tag: string;
    eyebrow: string;
    title: string;
    description: string;
    instructor: string;
    details: readonly string[];
    primary: ContentLink;
    secondary: ContentLink;
    image: ContentImage;
};

export const featuredCourse: FeaturedCourseContent = {
    tag: "Featured course",
    eyebrow: "Most popular this month",
    title: "Designing products people understand.",
    description:
        "Learn how to turn complex workflows into simple, intentional product experiences through research, structure and thoughtful interaction design.",
    instructor: "with Maya Chen · Senior Product Designer",
    details: ["8 lessons", "2h 40min", "Intermediate"],
    primary: { label: "View course", href: `#${sectionIds.contact}` },
    secondary: { label: "Browse all courses", href: `#${sectionIds.courses}` },
    image: {
        src: "/images/featured-course.jpg",
        alt: "Product design student sketching interface ideas at a desk full of materials",
        width: 700,
        height: 500,
    },
};

export type TestimonialContent = {
    quote: string;
    name: string;
    role: string;
    avatar: ContentImage;
    /** Accessible name of the section (quote plus stats). */
    sectionLabel: string;
};

export const testimonial: TestimonialContent = {
    quote: "The lessons are short enough to fit into my week, but detailed enough that I actually leave with something I can use.",
    name: "Alex Morgan",
    role: "Product Manager",
    // Decorative: the name is printed next to the photo.
    avatar: { src: "/images/avatars/alex-morgan.jpg", alt: "", width: 200, height: 200 },
    sectionLabel: "What learners say",
};

/** One photo in the people collage, sized in design pixels on the 520 px-wide desktop collage. */
export type CollageImage = ContentImage & {
    /** Rendered size in the desktop frame. */
    frame: { width: number; height: number };
};

export type CollageColumn = {
    /** Top offset of the column in design pixels. */
    offset: number;
    align: "start" | "end";
    images: readonly CollageImage[];
};

export type PeopleContent = {
    eyebrow: string;
    title: string;
    description: string;
    cta: ContentLink;
    collageLabel: string;
    columns: readonly CollageColumn[];
};

function photo(
    n: number,
    alt: string,
    source: [number, number],
    frame: [number, number],
): CollageImage {
    return {
        src: `/images/people/people-${String(n).padStart(2, "0")}.jpg`,
        alt,
        width: source[0],
        height: source[1],
        frame: { width: frame[0], height: frame[1] },
    };
}

export const people: PeopleContent = {
    eyebrow: "The people",
    title: "Meet international students & teachers",
    // Placeholder copy kept as in the design (MASTERPLAN §10.3).
    description:
        "Morbi sit egestas dignissim pharetra, sed amet. Tempus justo senectus risus ac vel, velit, nunc. Eget commodo eget in aliquam facilisi facilisi nec magna hendrerit. Placerat ipsum sit tellus urna, faucibus aenean lorem faucibus integer.",
    cta: { label: "Explore teachers and students", href: `#${sectionIds.contact}` },
    collageLabel: "Students and teachers learning with Luma",
    columns: [
        {
            offset: 64.2,
            align: "end",
            images: [
                photo(
                    1,
                    "Girl waving during an online class at her desk",
                    [1880, 1255],
                    [102.72, 154.08],
                ),
                photo(
                    2,
                    "Group of students studying together at a laptop",
                    [1880, 1253],
                    [138.03, 207.05],
                ),
            ],
        },
        {
            offset: 25.68,
            align: "start",
            images: [
                photo(3, "Student in a hoodie reading a book", [1880, 1253], [102.72, 170.13]),
                photo(
                    4,
                    "Two women singing at a music stand by a window",
                    [868, 1300],
                    [102.72, 172.54],
                ),
                photo(5, "Student reading at a desk beside a tablet", [975, 1300], [102.72, 128.4]),
            ],
        },
        {
            offset: 0,
            align: "start",
            images: [
                photo(
                    6,
                    "Graduate in cap and gown holding a diploma",
                    [859, 1300],
                    [102.72, 137.23],
                ),
                photo(7, "Woman studying at a desk at home", [1880, 1253], [102.72, 138.03]),
                photo(8, "Student on a video call with a teacher", [1880, 1255], [102.72, 154.08]),
            ],
        },
        {
            offset: 0,
            align: "start",
            images: [
                photo(
                    9,
                    "Student with curly hair holding a red folder outdoors",
                    [1880, 1253],
                    [128.4, 204.64],
                ),
                photo(
                    10,
                    "Student in a hijab holding a coffee cup",
                    [1043, 1300],
                    [102.72, 132.42],
                ),
            ],
        },
    ],
};

export type ContactContent = {
    eyebrow: string;
    title: string;
    description: string;
    channels: readonly {
        icon: { src: string; width: number; height: number };
        title: string;
        detail: string;
        href?: string;
    }[];
    form: {
        title: string;
        description: string;
        fields: {
            name: { label: string; placeholder: string };
            email: { label: string; placeholder: string };
            message: { label: string; placeholder: string };
        };
        submit: string;
    };
};

export const contact: ContactContent = {
    eyebrow: "Contact",
    title: "Get in touch",
    description:
        "Have a question? We’re here to help. Whether you’re looking for the right course, learning with your team or interested in teaching with Luma, we’d love to hear from you.",
    channels: [
        {
            icon: { src: "/icons/icon-chat.svg", width: 24, height: 24 },
            title: "Email",
            detail: "contact@luma.com",
            href: "mailto:contact@luma.com",
        },
        {
            icon: { src: "/icons/icon-clock.svg", width: 20, height: 20 },
            title: "Response Time",
            detail: "Up to 24 hours on business days",
        },
    ],
    // English on every breakpoint (the mobile frame was in Portuguese, MASTERPLAN §10.3).
    form: {
        title: "Contact us",
        description: "Fill out the fields and we will get in touch.",
        fields: {
            name: { label: "Full name", placeholder: "Your name" },
            email: { label: "Email", placeholder: "youremail@example.com" },
            message: { label: "Your question", placeholder: "Tell us how we can help..." },
        },
        submit: "Send message",
    },
};

export type CtaContent = {
    avatars: readonly ContentImage[];
    title: string;
    description: string;
    primary: ContentLink;
    secondary: ContentLink;
};

export const cta: CtaContent = {
    avatars: learnerAvatars,
    title: "What will you learn next?",
    description: "Start with one course. Build from there.",
    primary: { label: "Explore all courses", href: `#${sectionIds.courses}` },
    secondary: { label: "Join Luma", href: `#${sectionIds.contact}` },
};
