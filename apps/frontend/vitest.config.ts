import { defineConfig } from "vitest/config";
import path from "path";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./__tests__/setup/setupTests.ts"],
    include: ["__tests__/**/*.test.{ts,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/vitest.setup.ts",
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
        "**/__tests__/**",
        "**/*.config.*",
        "**/setupTests.ts",
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
