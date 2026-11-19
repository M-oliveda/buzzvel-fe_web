import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { delay, http, HttpResponse, type JsonBodyType } from "msw";

import { contact } from "@/content/home";
import { server, setupMswServer } from "@/test/msw";

import { ContactForm } from "./contact-form";

const { form } = contact;
const ENDPOINT = "*/api/v1/contact";

setupMswServer();

function renderForm(): { user: UserEvent } {
    const user = userEvent.setup();
    render(
        <>
            <h3 id="form-title">{form.title}</h3>
            <ContactForm labelledBy="form-title" />
        </>,
    );
    return { user };
}

const field = {
    name: () => screen.getByLabelText(form.fields.name.label),
    email: () => screen.getByLabelText(form.fields.email.label),
    message: () => screen.getByLabelText(form.fields.message.label),
};

const submitButton = (): HTMLElement => screen.getByRole("button", { name: form.submit });

async function fillValid(user: UserEvent): Promise<void> {
    await user.type(field.name(), "Ada Lovelace");
    await user.type(field.email(), "ada@example.com");
    await user.type(field.message(), "Which course should I start with?");
}

function respond(status: number, body: JsonBodyType): void {
    server.use(http.post(ENDPOINT, () => HttpResponse.json(body, { status })));
}

describe("ContactForm", () => {
    it("is named by its heading and labels every visible field", () => {
        renderForm();

        expect(screen.getByRole("form", { name: form.title })).toBeInTheDocument();
        expect(field.name()).toHaveAttribute("autocomplete", "name");
        expect(field.email()).toHaveAttribute("type", "email");
        expect(field.message().tagName).toBe("TEXTAREA");
    });

    it("hides the honeypot from people and assistive technology", () => {
        renderForm();

        // Role queries skip aria-hidden content, as assistive technology does.
        expect(screen.queryByRole("textbox", { name: form.honeypotLabel })).not.toBeInTheDocument();
        const honeypot = document.getElementById("contact-website");
        expect(honeypot).toHaveAttribute("tabindex", "-1");
        expect(honeypot?.closest("[aria-hidden='true']")).not.toBeNull();
    });

    it("validates a field when it loses focus and links the error to it", async () => {
        const { user } = renderForm();

        await user.type(field.email(), "not-an-email");
        await user.tab();

        expect(field.email()).toHaveAttribute("aria-invalid", "true");
        expect(field.email()).toHaveAccessibleDescription(form.errors.emailInvalid);

        await user.clear(field.email());
        await user.type(field.email(), "ada@example.com");
        expect(field.email()).not.toHaveAttribute("aria-invalid");
    });

    it("shows every error and focuses the first invalid field on an empty submit", async () => {
        const { user } = renderForm();

        await user.click(submitButton());

        expect(await screen.findByText(form.errors.nameTooShort)).toBeInTheDocument();
        expect(screen.getByText(form.errors.emailInvalid)).toBeInTheDocument();
        expect(screen.getByText(form.errors.messageTooShort)).toBeInTheDocument();
        expect(field.name()).toHaveFocus();
    });

    it("keeps an empty status region mounted so the success message is announced", () => {
        renderForm();

        expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("announces success and clears the form after a 201", async () => {
        respond(201, { status: "received", id: "msg-1" });
        const { user } = renderForm();

        await fillValid(user);
        await user.click(submitButton());

        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(form.success));
        expect(field.name()).toHaveValue("");
        expect(field.message()).toHaveValue("");
    });

    it("shows the server's field errors and focuses the first one", async () => {
        respond(400, {
            error: "validation",
            fieldErrors: { email: ["Server says no."], message: ["Too spammy."] },
        });
        const { user } = renderForm();

        await fillValid(user);
        await user.click(submitButton());

        await waitFor(() => expect(field.email()).toHaveFocus());
        expect(field.email()).toHaveAccessibleDescription("Server says no.");
        expect(field.message()).toHaveAccessibleDescription("Too spammy.");
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it.each([
        ["the server fails", 500, { error: "internal" }, form.failure.server],
        ["the rate limit is hit", 429, { error: "rate_limited" }, form.failure.rateLimited],
    ])("shows an alert and keeps the input when %s", async (_case, status, body, message) => {
        respond(status, body);
        const { user } = renderForm();

        await fillValid(user);
        await user.click(submitButton());

        expect(await screen.findByRole("alert")).toHaveTextContent(message);
        expect(field.name()).toHaveValue("Ada Lovelace");
    });

    it("shows a network alert when the request cannot be sent", async () => {
        server.use(http.post(ENDPOINT, () => HttpResponse.error()));
        const { user } = renderForm();

        await fillValid(user);
        await user.click(submitButton());

        expect(await screen.findByRole("alert")).toHaveTextContent(form.failure.network);
    });

    it("marks the button busy while sending, keeps focus on it and ignores repeat submits", async () => {
        let calls = 0;
        server.use(
            http.post(ENDPOINT, async () => {
                calls += 1;
                await delay(50);
                return HttpResponse.json({ status: "received", id: "msg-1" }, { status: 201 });
            }),
        );
        const { user } = renderForm();
        await fillValid(user);

        submitButton().focus();
        await user.keyboard("{Enter}");

        const pending = await screen.findByRole("button", { name: form.pending });
        expect(pending).toHaveAttribute("aria-disabled", "true");
        expect(pending).toHaveFocus();

        await user.keyboard("{Enter}");
        await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(form.success));
        expect(calls).toBe(1);
        expect(submitButton()).not.toHaveAttribute("aria-disabled");
    });
});
