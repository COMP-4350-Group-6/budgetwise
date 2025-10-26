import { defineConfig } from 'vitest/config';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['tests/integration/**/*.{test,spec}.{ts,tsx,js,jsx}'],
    environment: 'jsdom',
    globals: true,
    reporters: ['default'],
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ['tests/integration/frontend/setup/setupTests.ts'],
    coverage: { 
      reporter: ['text', 'html'], 
      reportsDirectory: 'coverage/integration',
      include: ['packages/**/src/**/*.{ts,tsx}', 'apps/**/src/**/*.{ts,tsx}'],
      exclude: ['**/node_modules/**', '**/test/**', '**/tests/**']
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/frontend/src'),
      '@budget/domain': path.resolve(__dirname, 'packages/domain/src'),
      '@budget/domain/*': path.resolve(__dirname, 'packages/domain/src/*'),
      '@budget/usecases': path.resolve(__dirname, 'packages/usecases/src'),
      '@budget/usecases/*': path.resolve(__dirname, 'packages/usecases/src/*'),
      '@budget/adapters-auth-supabase': path.resolve(__dirname, 'packages/adapters/auth-supabase/src'),
      '@budget/adapters-auth-supabase/*': path.resolve(__dirname, 'packages/adapters/auth-supabase/src/*'),
      '@budget/adapters-persistence-local': path.resolve(__dirname, 'packages/adapters/persistence/local/src'),
      '@budget/adapters-persistence-local/*': path.resolve(__dirname, 'packages/adapters/persistence/local/src/*'),
      '@budget/composition-web-auth-client': path.resolve(__dirname, 'packages/composition/web-auth-client/src'),
      '@budget/composition-web-auth-client/*': path.resolve(__dirname, 'packages/composition/web-auth-client/src/*'),
    },
  },
});