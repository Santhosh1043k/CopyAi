import { defineConfig, globalIgnores } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'
import convexPlugin from '@convex-dev/eslint-plugin'

export default defineConfig([
  ...tanstackConfig,
  ...convexPlugin.configs.recommended,
  globalIgnores(['convex/_generated']),
  // Server and api are plain Node.js; don't require them to be in the TS project
  {
    files: ['server/**/*.js', 'api/**/*.js'],
    languageOptions: {
      parserOptions: {
        project: false,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
  },
])
