import { defineConfig } from 'vitest/config';
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    env: { SUPABASE_JWT_SECRET: "test-only" },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/*.config.*', '**/tests/**'],
    },
  },
  resolve: { alias: { '@': './src' } }
});