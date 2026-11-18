import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge only knows Tailwind's default theme. Without this, a custom size such as
// `text-overline` is read as a text colour and dropped when a colour class follows it, and
// `py-section` would not replace `py-3`. Keep in sync with the tokens in src/app/globals.css.
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: [
                "h1",
                "h2",
                "h3",
                "h5",
                "quote",
                "subtitle-1",
                "subtitle-2",
                "body",
                "caption",
                "overline",
            ],
            spacing: ["gutter", "section", "header"],
            container: ["content"],
            shadow: ["float", "card", "dark-m"],
            font: ["display"],
        },
    },
});

/** Joins class names and resolves conflicting Tailwind utilities (last one wins). */
export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}
