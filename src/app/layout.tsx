import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { site } from "@/content/site";

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
    title: site.title,
    description: site.description,
};

type RootLayoutProps = Readonly<{ children: ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps): ReactNode {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${plusJakartaSans.variable} h-full antialiased`}
        >
            <body className="flex min-h-full flex-col">{children}</body>
        </html>
    );
}
