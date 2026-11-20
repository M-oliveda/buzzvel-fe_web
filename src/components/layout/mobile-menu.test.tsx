import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { site } from "@/content/site";

import { MobileMenu } from "./mobile-menu";

type ChangeListener = (event: MediaQueryListEvent) => void;

/** jsdom has no matchMedia; this stub lets a test fire a breakpoint change. */
function stubMatchMedia(): { fire: (matches: boolean) => void; listeners: Set<ChangeListener> } {
    const listeners = new Set<ChangeListener>();
    vi.stubGlobal(
        "matchMedia",
        vi.fn((query: string) => ({
            matches: false,
            media: query,
            addEventListener: (_type: "change", listener: ChangeListener) =>
                listeners.add(listener),
            removeEventListener: (_type: "change", listener: ChangeListener) =>
                listeners.delete(listener),
        })),
    );

    return {
        listeners,
        fire: (matches) => {
            for (const listener of listeners) listener({ matches } as MediaQueryListEvent);
        },
    };
}

function getPanel(): HTMLElement {
    const id = screen.getByRole("button", { name: site.menuLabel }).getAttribute("aria-controls");
    const panel = id ? document.getElementById(id) : null;
    if (!panel) throw new Error("Menu panel not found");
    return panel;
}

describe("MobileMenu", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("starts closed, with the panel hidden and controlled by the button", () => {
        stubMatchMedia();
        render(<MobileMenu />);

        const button = screen.getByRole("button", { name: site.menuLabel });
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(getPanel()).not.toBeVisible();
    });

    it("opens and closes from the button", async () => {
        stubMatchMedia();
        const user = userEvent.setup();
        render(<MobileMenu />);

        const button = screen.getByRole("button", { name: site.menuLabel });
        await user.click(button);
        expect(button).toHaveAttribute("aria-expanded", "true");
        expect(getPanel()).toBeVisible();

        await user.click(button);
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(getPanel()).not.toBeVisible();
    });

    it("lists every nav link and both actions when open", async () => {
        stubMatchMedia();
        const user = userEvent.setup();
        render(<MobileMenu />);

        await user.click(screen.getByRole("button", { name: site.menuLabel }));

        const panel = getPanel();
        const nav = within(panel).getByRole("navigation", { name: site.nav.label });
        for (const link of site.nav.links) {
            expect(within(nav).getByRole("link", { name: link.label })).toHaveAttribute(
                "href",
                link.href,
            );
        }
        expect(within(panel).getByRole("link", { name: site.actions.login.label })).toBeVisible();
        expect(within(panel).getByRole("link", { name: site.actions.primary.label })).toBeVisible();
    });

    it("closes when a link is chosen", async () => {
        stubMatchMedia();
        const user = userEvent.setup();
        render(<MobileMenu />);

        const button = screen.getByRole("button", { name: site.menuLabel });
        await user.click(button);
        await user.click(
            within(getPanel()).getByRole("link", { name: site.actions.primary.label }),
        );

        expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("moves focus to the first link when opened and traps Tab inside the menu", async () => {
        stubMatchMedia();
        const user = userEvent.setup();
        render(<MobileMenu />);

        const button = screen.getByRole("button", { name: site.menuLabel });
        await user.click(button);

        const [firstLink] = site.nav.links;
        expect(within(getPanel()).getByRole("link", { name: firstLink?.label })).toHaveFocus();

        // Last element (primary action) wraps to the menu button, then Shift+Tab wraps back.
        within(getPanel()).getByRole("link", { name: site.actions.primary.label }).focus();
        await user.tab();
        expect(button).toHaveFocus();
        await user.tab({ shift: true });
        expect(
            within(getPanel()).getByRole("link", { name: site.actions.primary.label }),
        ).toHaveFocus();
    });

    it("closes on Escape and returns focus to the menu button", async () => {
        stubMatchMedia();
        const user = userEvent.setup();
        render(<MobileMenu />);

        const button = screen.getByRole("button", { name: site.menuLabel });
        await user.click(button);
        await user.keyboard("{Escape}");

        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveFocus();
    });

    it("locks page scroll only while open", async () => {
        stubMatchMedia();
        const user = userEvent.setup();
        render(<MobileMenu />);

        const button = screen.getByRole("button", { name: site.menuLabel });
        expect(document.body.style.overflow).toBe("");

        await user.click(button);
        expect(document.body.style.overflow).toBe("hidden");

        await user.click(button);
        expect(document.body.style.overflow).toBe("");
    });

    it("closes when the viewport grows to the desktop breakpoint", async () => {
        const media = stubMatchMedia();
        const user = userEvent.setup();
        render(<MobileMenu />);

        const button = screen.getByRole("button", { name: site.menuLabel });
        await user.click(button);
        expect(media.listeners.size).toBe(1);

        act(() => media.fire(false));
        expect(button).toHaveAttribute("aria-expanded", "true");

        act(() => media.fire(true));
        expect(button).toHaveAttribute("aria-expanded", "false");
        // The listener is removed once the menu is closed.
        expect(media.listeners.size).toBe(0);
    });
});
