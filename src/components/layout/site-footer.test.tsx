import { render, screen, within } from "@testing-library/react";

import { footer } from "@/content/footer-links";
import { site } from "@/content/site";

import { SiteFooter } from "./site-footer";

describe("SiteFooter", () => {
    it("renders the contentinfo landmark with the brand and tagline", () => {
        render(<SiteFooter />);

        const contentinfo = screen.getByRole("contentinfo");
        expect(within(contentinfo).getByRole("link", { name: site.logo.label })).toBeVisible();
        expect(within(contentinfo).getByText(footer.tagline)).toBeVisible();
        expect(within(contentinfo).getByText(footer.copyright)).toBeVisible();
    });

    it("renders each column as a list named by its title", () => {
        render(<SiteFooter />);

        for (const column of footer.columns) {
            const list = screen.getByRole("list", { name: column.title });
            const items = within(list).getAllByRole("link");
            expect(items.map((item) => item.textContent)).toEqual(
                column.links.map((link) => link.label),
            );
        }
    });
});
