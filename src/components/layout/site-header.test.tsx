import { render, screen, within } from "@testing-library/react";

import { site } from "@/content/site";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
    it("renders the banner landmark with a logo link home", () => {
        render(<SiteHeader />);

        const banner = screen.getByRole("banner");
        expect(within(banner).getByRole("link", { name: site.logo.label })).toHaveAttribute(
            "href",
            "/",
        );
    });

    it("links every nav item to its section anchor", () => {
        render(<SiteHeader />);

        const nav = screen.getByRole("navigation", { name: site.nav.label });
        for (const link of site.nav.links) {
            expect(within(nav).getByRole("link", { name: link.label })).toHaveAttribute(
                "href",
                link.href,
            );
        }
    });

    it("renders the log-in and primary actions", () => {
        render(<SiteHeader />);

        expect(screen.getByRole("link", { name: site.actions.login.label })).toHaveAttribute(
            "href",
            site.actions.login.href,
        );
        expect(screen.getByRole("link", { name: site.actions.primary.label })).toHaveAttribute(
            "href",
            site.actions.primary.href,
        );
    });

    it("includes a collapsed mobile menu button", () => {
        render(<SiteHeader />);

        expect(screen.getByRole("button", { name: site.menuLabel })).toHaveAttribute(
            "aria-expanded",
            "false",
        );
    });
});
