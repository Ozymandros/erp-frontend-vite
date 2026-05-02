import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/src/test/e2e/**", // Exclude Playwright E2E tests
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/",
        "src/test/",
        "src/**/*.test.{ts,tsx}",
        "src/**/*.spec.{ts,tsx}",
        "src/**/__tests__/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData.ts",
        "**/lib/validation/index.ts",
        "dist/",
        "src/main.tsx",
        "src/vite-env.d.ts",
        // Barrel re-exports only — no executable logic worth counting toward coverage gates.
        "src/api/services/index.ts",
        "src/api/constants/index.ts",
        // Large generated-style DTO definitions; runtime behaviour is covered via services/pages.
        "src/types/api.types.ts",
        // Type-only interfaces (no runtime statements).
        "src/contexts/toast.types.ts",
      ],
      // Minimum gate for `pnpm test:coverage` (lines/statements/functions ≥80%).
      // Branch coverage stays slightly lower: conditional UI paths are harder to exhaust in unit tests.
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 65,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
