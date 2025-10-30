import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup/setupTests.ts"],
    exclude: [
      "**/node_modules/**",
      "**/postcss.config.mjs",
      "**/next.config.ts",
      "**/src/app/layout.tsx",
    ],
    css: false,

    coverage: {
      provider: "v8", // faster, no deps
      reporter: ["text", "html", "lcov"], // 'lcov' helps CI tools & badges
      reportsDirectory: "./coverage", // use conventional dir name
      include: ["src/**/*.{ts,tsx}"], // focus on source code only
      exclude: [
        "**/tests/**",
        "**/*.config.*",
        "**/node_modules/**",
        "**/src/app/layout.tsx",
      ],
      thresholds: {
        lines: 50,
        statements: 50,
        branches: 40,
        functions: 50,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
