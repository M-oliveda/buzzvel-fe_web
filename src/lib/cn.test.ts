// @vitest-environment node
import { cn } from "./cn";

describe("cn", () => {
    it("joins truthy class names and drops falsy ones", () => {
        expect(cn("a", false, undefined, null, "b", { c: true, d: false })).toBe("a b c");
    });

    it("lets later Tailwind utilities override conflicting earlier ones", () => {
        expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    });
});
