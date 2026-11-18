import { render, screen } from "@testing-library/react";

import { MotionProvider } from "./motion-provider";

describe("MotionProvider", () => {
    it("renders its children", () => {
        render(
            <MotionProvider>
                <p>Content</p>
            </MotionProvider>,
        );

        expect(screen.getByText("Content")).toBeVisible();
    });
});
