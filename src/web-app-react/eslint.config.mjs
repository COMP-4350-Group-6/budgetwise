import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import nextPlugin from '@next/eslint-plugin-next'

export default [

  { ignores: ['.next/**', 'node_modules/**', 'dist/**', 'build/**'] },

  
  js.configs.recommended,

 
  ...tseslint.configs.recommended,

  
  {
    plugins: { '@next/next': nextPlugin },
    rules: {
      // turn on/off Next rules as you wish
      '@next/next/no-html-link-for-pages': 'off',
    },
  },

  // Runtime globals
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

 
  {
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off',
    },
  },
]