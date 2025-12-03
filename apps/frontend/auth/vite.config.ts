import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Workspace package aliases for development
      '@budget/schemas': resolve(__dirname, '../../../packages/schemas/src/index.ts'),
      '@budget/composition-web-auth-api': resolve(__dirname, '../../../packages/composition/web-auth-api/src/index.ts'),
      '@budget/adapters-auth-api': resolve(__dirname, '../../../packages/adapters/auth-api/src/index.ts'),
      '@budget/ports': resolve(__dirname, '../../../packages/ports/src/index.ts'),
      '@budget/usecases': resolve(__dirname, '../../../packages/usecases/src/index.ts'),
      '@budget/domain': resolve(__dirname, '../../../packages/domain/src'),
    },
  },
  // Optimize deps to pre-bundle workspace packages
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia'],
  },
})
