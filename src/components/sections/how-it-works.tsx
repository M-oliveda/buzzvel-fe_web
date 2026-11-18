import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionHeading } from "@/components/ui/section-heading";
import { sectionIds } from "@/content/site";
import { steps, type StepIcon } from "@/content/steps";

/** Three steps, stacked on mobile and in a row with a connecting line from `md`. */
export function HowItWorks(): ReactNode {
    return (
        <section
            id={sectionIds.howItWorks}
            aria-labelledby="how-it-works-title"
            className="bg-muted"
        >
            <Container className="py-section">
                <SectionHeading
                    titleId="how-it-works-title"
                    align="center"
                    eyebrow={steps.eyebrow}
                    title={steps.title}
                />

                {/*
                 * --steps-gap drives both the column gap and where the connecting line stops: it
                 * runs from the first tile to just inside the third (left 52 px, ends 13 px into
                 * column three, as in the desktop frame). On mobile the steps are 84 px apart with
                 * a 46 px vertical line above tiles two and three (mobile frame).
                 */}
                <ol className="relative mt-11 grid gap-21 [--steps-gap:2.5rem] md:mt-20 md:grid-cols-3 md:gap-(--steps-gap) md:py-7 md:before:absolute md:before:top-14 md:before:left-13 md:before:h-px md:before:w-[calc(100%-(100%-2*var(--steps-gap))/3-2.4375rem)] md:before:bg-border md:before:content-[''] lg:[--steps-gap:5rem]">
                    {steps.items.map((step) => (
                        <li
                            key={step.label}
                            className="relative flex flex-col items-start max-md:not-first:before:absolute max-md:not-first:before:-top-11.5 max-md:not-first:before:left-7 max-md:not-first:before:h-11.5 max-md:not-first:before:w-px max-md:not-first:before:bg-border max-md:not-first:before:content-['']"
                        >
                            <StepTile icon={step.icon} />
                            <Eyebrow className="mt-6 text-muted-foreground">{step.label}</Eyebrow>
                            <h3 className="mt-2 text-h5">{step.title}</h3>
                            <p className="mt-3 text-subtitle-2 text-muted-foreground">
                                {step.description}
                            </p>
                        </li>
                    ))}
                </ol>
            </Container>
        </section>
    );
}

type StepTileProps = {
    icon: StepIcon;
};

/** Decorative 56 px tile per step, drawn with tokens (shapes copied from the Figma frame). */
function StepTile({ icon }: StepTileProps): ReactNode {
    if (icon === "focus") {
        return (
            <span aria-hidden="true" className="relative size-14 rounded-full bg-secondary">
                <span className="absolute top-2 left-2 size-6 rounded-sm bg-primary" />
            </span>
        );
    }

    if (icon === "experience") {
        return (
            <span aria-hidden="true" className="relative size-14">
                <span className="absolute inset-0 rotate-12 rounded-md bg-peach" />
                <span className="absolute top-6 left-6 size-7 rounded-full bg-coral" />
            </span>
        );
    }

    return (
        <span aria-hidden="true" className="relative size-14 rounded-lg bg-sand">
            <span className="absolute top-7 left-2 size-5 rounded-full bg-gold" />
        </span>
    );
}
