/** Which decorative tile the step shows (shapes from the Figma frame). */
export type StepIcon = "focus" | "experience" | "practice";

export type Step = {
    /** The design repeats "Step 01" on every card; numbered 01–03 here (MASTERPLAN §10.3). */
    label: string;
    title: string;
    description: string;
    icon: StepIcon;
};

export type StepsContent = {
    eyebrow: string;
    title: string;
    items: readonly Step[];
};

export const steps: StepsContent = {
    eyebrow: "How Luma works",
    title: "Less browsing. More learning.",
    items: [
        {
            label: "Step 01",
            title: "Choose your focus",
            description:
                "Find courses based on the skill you want to build, not endless content categories.",
            icon: "focus",
        },
        {
            label: "Step 02",
            title: "Learn from experience",
            description: "Follow concise lessons created by professionals who use these skills.",
            icon: "experience",
        },
        {
            label: "Step 03",
            title: "Put it into practice",
            description:
                "Every course includes practical exercises designed to turn knowledge into action.",
            icon: "practice",
        },
    ],
};
