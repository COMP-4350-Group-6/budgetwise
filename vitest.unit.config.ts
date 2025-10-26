import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    exclude: ['**/*.int.test.ts', '**/*integration*'],
    environment: 'node',
    globals: true,
    reporters: ['default'],
    coverage: { 
      reporter: ['text', 'html'], 
      reportsDirectory: 'coverage/unit',
      include: ['packages/**/src/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/test/**', '**/tests/**']
    },
  },
  resolve: {
    alias: {
      '@budget/domain': path.resolve(__dirname, 'packages/domain/src'),
      '@budget/domain/*': path.resolve(__dirname, 'packages/domain/src/*'),
      '@budget/usecases': path.resolve(__dirname, 'packages/usecases/src'),
      '@budget/usecases/*': path.resolve(__dirname, 'packages/usecases/src/*'),
      '@budget/adapters-auth-supabase': path.resolve(__dirname, 'packages/adapters/auth-supabase/src'),
      '@budget/adapters-auth-supabase/*': path.resolve(__dirname, 'packages/adapters/auth-supabase/src/*'),
      '@budget/adapters-system': path.resolve(__dirname, 'packages/adapters/system/src'),
      '@budget/adapters-system/*': path.resolve(__dirname, 'packages/adapters/system/src/*'),
      '@budget/adapters-persistence-local': path.resolve(__dirname, 'packages/adapters/persistence/local/src'),
      '@budget/adapters-persistence-local/*': path.resolve(__dirname, 'packages/adapters/persistence/local/src/*'),
      '@budget/ports': path.resolve(__dirname, 'packages/ports/src'),
      '@budget/ports/*': path.resolve(__dirname, 'packages/ports/src/*'),
    },
  },
});