import { renderHook } from "@testing-library/react";

import { useBodyScrollLock } from "./use-body-scroll-lock";

describe("useBodyScrollLock", () => {
    afterEach(() => {
        document.body.style.overflow = "";
    });

    it("leaves the body alone while unlocked", () => {
        renderHook(() => useBodyScrollLock(false));

        expect(document.body.style.overflow).toBe("");
    });

    it("hides body overflow while locked and restores the previous value on unlock", () => {
        document.body.style.overflow = "auto";
        const { rerender } = renderHook(({ locked }) => useBodyScrollLock(locked), {
            initialProps: { locked: true },
        });

        expect(document.body.style.overflow).toBe("hidden");

        rerender({ locked: false });
        expect(document.body.style.overflow).toBe("auto");
    });

    it("restores the body when unmounted while locked", () => {
        const { unmount } = renderHook(() => useBodyScrollLock(true));

        unmount();
        expect(document.body.style.overflow).toBe("");
    });
});
