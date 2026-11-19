import { act, render, screen, waitFor } from "@testing-library/react";

import { setReducedMotion, triggerIntersection } from "@/test/browser-stubs";

import { MotionProvider } from "./motion-provider";
import { Reveal } from "./reveal";

function renderReveal(): HTMLElement {
    render(
        <MotionProvider>
            <Reveal className="custom">
                <p>Revealed content</p>
            </Reveal>
        </MotionProvider>,
    );

    const wrapper = screen.getByText("Revealed content").parentElement;
    if (!wrapper) throw new Error("Reveal wrapper not found");
    return wrapper;
}

describe("Reveal", () => {
    it("keeps its content in the DOM and merges the class name", () => {
        const wrapper = renderReveal();

        expect(wrapper).toHaveAttribute("data-slot", "reveal");
        expect(wrapper).toHaveClass("custom");
    });

    it("starts hidden and shows the content once it scrolls into view", async () => {
        const wrapper = renderReveal();

        expect(wrapper).not.toBeVisible();

        act(() => triggerIntersection());
        await waitFor(() => expect(wrapper).toBeVisible());
    });

    it("shows the content without waiting to be in view under reduced motion", () => {
        setReducedMotion(true);
        const wrapper = renderReveal();

        // No intersection is triggered: the content is revealed on mount, wherever it is.
        expect(wrapper).toBeVisible();
        expect(wrapper.style.transform).toBe("none");
    });
});
