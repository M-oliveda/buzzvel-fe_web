import Image from "next/image";
import type { ReactNode } from "react";

import { AvatarStack } from "@/components/ui/avatar-stack";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { cta } from "@/content/home";
import { cn } from "@/lib/cn";

// Decorative shapes from the desktop frame (1280 × 470), positioned in percent so they spread
// with the band. The mobile frame has none, so the whole layer is hidden below `lg`.
const shapes: readonly { className: string }[] = [
    { className: "top-[3.4%] left-[1.7%] size-27 rounded-full border-2 border-peach" },
    { className: "top-[79.4%] left-[4.4%] size-30 rounded-full bg-peach" },
    { className: "top-[99.8%] left-[83.1%] size-10 rounded-full bg-peach" },
    { className: "-top-[2.8%] left-[90.2%] size-28.75 rotate-12 rounded-md bg-peach" },
    { className: "top-[50.1%] -left-[2.2%] size-14 rotate-12 rounded-md bg-peach" },
    {
        className: "top-[91.4%] left-[94.4%] size-8 rounded-full border-2 border-peach",
    },
    { className: "top-[9.2%] left-[68.5%] size-8 rounded-full border-2 border-peach" },
    {
        className: "top-[10.1%] left-[25.2%] size-14 rotate-12 rounded-md border border-peach",
    },
];

const icons: readonly { src: string; size: number; className: string }[] = [
    { src: "/icons/cta-icon-a.svg", size: 83, className: "top-[78.7%] left-[22%] rotate-15" },
    { src: "/icons/cta-icon-ring.svg", size: 160, className: "top-[38.4%] left-[84.4%]" },
    { src: "/icons/cta-icon-b.svg", size: 32, className: "top-[45.6%] left-[11%]" },
    { src: "/icons/cta-icon-c.svg", size: 61, className: "top-[17.5%] left-[79.4%]" },
    { src: "/icons/cta-icon-d.svg", size: 48, className: "top-[81.2%] left-[75.2%]" },
];

/** Closing yellow band with avatars, headline and two calls to action. */
export function CtaBand(): ReactNode {
    return (
        <section aria-labelledby="cta-title" className="relative overflow-hidden bg-sand">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 max-lg:hidden">
                {shapes.map((shape) => (
                    <span key={shape.className} className={cn("absolute", shape.className)} />
                ))}
                {icons.map((icon) => (
                    <Image
                        key={icon.src}
                        src={icon.src}
                        alt=""
                        width={icon.size}
                        height={icon.size}
                        className={cn("absolute", icon.className)}
                    />
                ))}
            </div>

            <div className="relative mx-auto flex max-w-180 flex-col items-center px-gutter py-section text-center sm:px-8">
                <AvatarStack avatars={cta.avatars} size="md" ring="accent" />
                <SectionHeading
                    titleId="cta-title"
                    align="center"
                    size="lg"
                    title={cta.title}
                    description={cta.description}
                    className="mt-8"
                />
                <div className="mt-10 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
                    <Button asChild>
                        <a href={cta.primary.href}>{cta.primary.label}</a>
                    </Button>
                    <Button asChild variant="outline">
                        <a href={cta.secondary.href}>{cta.secondary.label}</a>
                    </Button>
                </div>
            </div>
        </section>
    );
}
