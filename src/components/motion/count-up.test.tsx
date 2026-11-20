import { act, render, screen, waitFor } from "@testing-library/react";

import { setReducedMotion, triggerIntersection } from "@/test/browser-stubs";

import { CountUp, parseStatValue } from "./count-up";
import { MotionProvider } from "./motion-provider";

/** The digits sighted users see; the accessible copy is the visually hidden sibling. */
function visibleDigits(): string | null {
    return document.querySelector("[aria-hidden='true']")?.textContent ?? null;
}

function renderCountUp(value: string): void {
    render(
        <MotionProvider>
            <CountUp value={value} />
        </MotionProvider>,
    );
}

describe("parseStatValue", () => {
    it.each([
        ["24K+", { prefix: "", number: 24, decimals: 0, suffix: "K+" }],
        ["120+", { prefix: "", number: 120, decimals: 0, suffix: "+" }],
        ["92%", { prefix: "", number: 92, decimals: 0, suffix: "%" }],
        ["$4.9", { prefix: "$", number: 4.9, decimals: 1, suffix: "" }],
    ])("parses %s", (value, expected) => {
        expect(parseStatValue(value)).toEqual(expected);
    });

    it.each(["Top rated", "24/7", ""])("returns null for %j", (value) => {
        expect(parseStatValue(value)).toBeNull();
    });
});

describe("CountUp", () => {
    it("always exposes the final value as text for assistive technology", () => {
        renderCountUp("24K+");

        expect(screen.getByText("24K+", { selector: ".sr-only" })).toBeInTheDocument();
    });

    it("resets to zero off-screen and counts up to the final value once in view", async () => {
        renderCountUp("24K+");

        await waitFor(() => expect(visibleDigits()).toBe("0K+"));

        act(() => triggerIntersection());
        await waitFor(() => expect(visibleDigits()).toBe("24K+"));
    });

    it("keeps decimals while counting", async () => {
        renderCountUp("4.9");

        await waitFor(() => expect(visibleDigits()).toBe("0.0"));
        act(() => triggerIntersection());
        await waitFor(() => expect(visibleDigits()).toBe("4.9"));
    });

    it("shows the final value straight away under reduced motion", () => {
        setReducedMotion(true);
        renderCountUp("92%");

        expect(visibleDigits()).toBe("92%");
    });

    it("renders values without a number as they are", () => {
        renderCountUp("Top rated");

        expect(visibleDigits()).toBe("Top rated");
        expect(screen.getByText("Top rated", { selector: ".sr-only" })).toBeInTheDocument();
    });
});
