import { defineConfig, globalIgnores } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import convexPlugin from '@convex-dev/eslint-plugin'

export default defineConfig([
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  globalIgnores(['convex/_generated']),
  // Server is plain Node.js; don't require it to be in the TS project
  {
    files: ['server/**/*.js'],
    languageOptions: {
      parserOptions: {
        project: false,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
])
