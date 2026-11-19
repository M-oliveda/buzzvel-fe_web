import "@testing-library/jest-dom/vitest";
import { MotionGlobalConfig } from "framer-motion";

import { installBrowserStubs } from "./src/test/browser-stubs";

// Animations jump straight to their end state, so tests assert outcomes without waiting.
MotionGlobalConfig.skipAnimations = true;

beforeEach(() => {
    // Server modules run under `// @vitest-environment node`, where there is no window to stub.
    if (typeof window !== "undefined") installBrowserStubs();
});
