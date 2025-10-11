import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  preview: { port: 5174 },
  resolve: {
    alias: {
      '@pages': '/src/pages',
      '@components': '/src/components',
    },
  },
})