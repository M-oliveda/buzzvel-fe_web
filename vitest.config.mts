import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [react()],
    resolve: { tsconfigPaths: true },
    test: {
        // jsdom by default; pure server modules opt into `// @vitest-environment node` per file.
        environment: "jsdom",
        globals: true,
        setupFiles: ["./vitest.setup.ts"],
        include: ["src/**/*.test.{ts,tsx}"],
        restoreMocks: true,
        coverage: {
            provider: "v8",
            reporter: ["text", "html", "lcov"],
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/**/*.test.{ts,tsx}",
                // Root layout is Next.js boilerplate (<html>/<body> shell); covered by e2e, not unit-testable in jsdom.
                "src/app/layout.tsx",
                // Boot hook only called by the Next.js server runtime; the validation it triggers is tested in env.test.ts.
                "src/instrumentation.ts",
                "src/instrumentation.node.ts",
                // Test-only helpers (jsdom browser stubs, MSW server, log capture), never shipped.
                "src/test/**",
                // Type-only declarations produce no runtime code.
                "src/types/**",
                "src/**/*.d.ts",
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80,
            },
        },
    },
});
