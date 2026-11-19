import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, type ReactNode } from "react";

import { getFocusable, useFocusTrap } from "./use-focus-trap";

type TrapProps = { active: boolean; withInitialFocus?: boolean };

function Trap({ active, withInitialFocus = false }: TrapProps): ReactNode {
    const container = useRef<HTMLDivElement>(null);
    const panel = useRef<HTMLDivElement>(null);
    useFocusTrap(container, active, withInitialFocus ? { initialFocus: panel } : {});

    return (
        <>
            <button type="button">Outside</button>
            <div ref={container}>
                <button type="button">Toggle</button>
                <div ref={panel}>
                    <a href="#one">One</a>
                    <button type="button" disabled>
                        Disabled
                    </button>
                    <div hidden>
                        <a href="#hidden">Hidden</a>
                    </div>
                    <a href="#two">Two</a>
                </div>
            </div>
        </>
    );
}

describe("getFocusable", () => {
    it("skips disabled controls and hidden subtrees", () => {
        render(<Trap active={false} />);
        const container = screen.getByRole("button", { name: "Toggle" }).parentElement;
        if (!container) throw new Error("Container not found");

        expect(getFocusable(container).map((element) => element.textContent)).toEqual([
            "Toggle",
            "One",
            "Two",
        ]);
    });
});

describe("useFocusTrap", () => {
    it("does nothing while inactive", async () => {
        const user = userEvent.setup();
        render(<Trap active={false} />);

        expect(document.body).toHaveFocus();
        await user.tab();
        expect(screen.getByRole("button", { name: "Outside" })).toHaveFocus();
    });

    it("focuses the first focusable element of the container on activation", () => {
        render(<Trap active />);

        expect(screen.getByRole("button", { name: "Toggle" })).toHaveFocus();
    });

    it("focuses the first element of `initialFocus` when given", () => {
        render(<Trap active withInitialFocus />);

        expect(screen.getByRole("link", { name: "One" })).toHaveFocus();
    });

    it("wraps Tab from the last element to the first and Shift+Tab back", async () => {
        const user = userEvent.setup();
        render(<Trap active />);

        screen.getByRole("link", { name: "Two" }).focus();
        await user.tab();
        expect(screen.getByRole("button", { name: "Toggle" })).toHaveFocus();

        await user.tab({ shift: true });
        expect(screen.getByRole("link", { name: "Two" })).toHaveFocus();
    });

    it("moves focus that escaped the container back inside", async () => {
        const user = userEvent.setup();
        render(<Trap active />);

        screen.getByRole("button", { name: "Outside" }).focus();
        await user.tab();
        expect(screen.getByRole("button", { name: "Toggle" })).toHaveFocus();
    });

    it("stops trapping once deactivated", async () => {
        const user = userEvent.setup();
        const { rerender } = render(<Trap active />);

        rerender(<Trap active={false} />);
        screen.getByRole("link", { name: "Two" }).focus();
        await user.tab();
        expect(screen.getByRole("link", { name: "Two" })).not.toHaveFocus();
        expect(screen.getByRole("button", { name: "Toggle" })).not.toHaveFocus();
    });
});
