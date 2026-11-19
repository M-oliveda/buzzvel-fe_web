import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { site } from "@/content/site";

import ErrorPage from "./error";
import NotFound, { metadata } from "./not-found";

const { notFound, error: errorCopy } = site.statusPages;

describe("NotFound", () => {
    it("explains the missing page under one h1 and links home", () => {
        render(<NotFound />);

        expect(screen.getByRole("main")).toHaveAttribute("id", "main");
        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(notFound.title);
        expect(screen.getByText(notFound.description)).toBeInTheDocument();
        expect(screen.getByRole("link", { name: notFound.home.label })).toHaveAttribute(
            "href",
            "/",
        );
        expect(screen.getByRole("link", { name: site.logo.label })).toHaveAttribute("href", "/");
    });

    it("sets a page title", () => {
        expect(metadata.title).toBe(`${notFound.title} — ${site.name}`);
    });
});

describe("ErrorPage", () => {
    it("offers a retry and a way home without revealing the error message", async () => {
        const user = userEvent.setup();
        const retry = vi.fn();
        render(<ErrorPage error={new Error("database password is hunter2")} retry={retry} />);

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(errorCopy.title);
        expect(screen.getByRole("link", { name: errorCopy.home.label })).toHaveAttribute(
            "href",
            "/",
        );
        expect(screen.queryByText(/hunter2/)).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: errorCopy.retry }));
        expect(retry).toHaveBeenCalledOnce();
    });

    it("shows the server digest as a reference that matches the logs", () => {
        const error = Object.assign(new Error("hidden"), { digest: "123456789" });
        render(<ErrorPage error={error} retry={vi.fn()} />);

        expect(screen.getByText("123456789")).toBeInTheDocument();
        expect(screen.getByText(new RegExp(errorCopy.reference))).toBeInTheDocument();
    });

    it.each([
        ["a plain Error", new Error("no digest")],
        ["a thrown string", "boom"],
        ["a non-string digest", Object.assign(new Error("x"), { digest: 42 })],
    ])("shows no reference for %s", (_case, error) => {
        render(<ErrorPage error={error} retry={vi.fn()} />);

        expect(screen.queryByText(new RegExp(errorCopy.reference))).not.toBeInTheDocument();
    });
});
