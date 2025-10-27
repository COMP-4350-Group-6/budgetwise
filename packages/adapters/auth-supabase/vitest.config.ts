import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/*.config.*', '**/tests/**'],
    },
  },
  resolve: { alias: { '@': './src' } }
});