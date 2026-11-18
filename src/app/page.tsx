import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Categories } from "@/components/sections/categories";
import { Contact } from "@/components/sections/contact";
import { CtaBand } from "@/components/sections/cta-band";
import { FeaturedCourse } from "@/components/sections/featured-course";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { People } from "@/components/sections/people";
import { TestimonialStats } from "@/components/sections/testimonial-stats";

// Section order follows MASTERPLAN §6.1.
export default function HomePage(): ReactNode {
    return (
        <>
            <SiteHeader />
            {/* tabIndex lets the skip link move focus here in every browser; no ring on the whole page. */}
            <main id="main" tabIndex={-1} className="flex-1 outline-none">
                <Hero />
                <Categories />
                <FeaturedCourse />
                <HowItWorks />
                <TestimonialStats />
                <People />
                <Contact />
                <CtaBand />
            </main>
            <SiteFooter />
        </>
    );
}
