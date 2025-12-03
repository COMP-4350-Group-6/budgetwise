import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      coverage: {
        reporter: ['lcov', 'text'],
        exclude: [
          'node_modules/**',
          'dist/**',
          '**/*.d.ts',
          'src/main.ts',
          'src/vite-env.d.ts',
        ],
      },
    },
  }),
)
