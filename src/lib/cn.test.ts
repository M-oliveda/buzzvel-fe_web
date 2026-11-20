// @vitest-environment node
import { cn } from "./cn";

describe("cn", () => {
    it("joins truthy class names and drops falsy ones", () => {
        expect(cn("a", false, undefined, null, "b", { c: true, d: false })).toBe("a b c");
    });

    it("lets later Tailwind utilities override conflicting earlier ones", () => {
        expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });

    it("keeps a design-token font size next to a text colour", () => {
        expect(cn("text-overline uppercase", "text-primary")).toBe(
            "text-overline uppercase text-primary",
        );
        expect(cn("text-body", "text-muted-foreground")).toBe("text-body text-muted-foreground");
    });

    it("resolves conflicts between design-token font sizes", () => {
        expect(cn("text-h3", "text-h2")).toBe("text-h2");
    });

    it("resolves conflicts between design-token spacing and the default scale", () => {
        expect(cn("py-3", "py-section")).toBe("py-section");
    });
});
