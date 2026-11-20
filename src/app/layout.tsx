import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { SkipLink } from "@/components/layout/skip-link";
import { MotionProvider } from "@/components/motion/motion-provider";
import { site } from "@/content/site";
import { getEnv } from "@/lib/env";

import "./globals.css";

// Body and UI text. 400 body, 600 overline, 700 buttons/labels (Figma text styles).
const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
    display: "swap",
    variable: "--font-inter",
});

// Headings. 800 H1-H3, 700 H5, 600 quotes (Figma text styles).
const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["600", "700", "800"],
    display: "swap",
    variable: "--font-jakarta",
});

export const metadata: Metadata = {
    // Resolves relative canonical and Open Graph URLs against the environment's origin.
    metadataBase: new URL(getEnv().NEXT_PUBLIC_SITE_URL),
    title: site.title,
    description: site.description,
    alternates: { canonical: "/" },
    openGraph: {
        type: "website",
        url: "/",
        siteName: site.name,
        title: site.title,
        description: site.description,
        locale: "en_US",
    },
    twitter: {
        card: "summary",
        title: site.title,
        description: site.description,
    },
};

export const viewport: Viewport = {
    themeColor: site.themeColor,
};

type RootLayoutProps = Readonly<{ children: ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col">
                <SkipLink />
                <MotionProvider>{children}</MotionProvider>
            </body>
        </html>
    );
}
