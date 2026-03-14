import { defineConfig } from 'eslint/config'
import { tanstackConfig } from '@tanstack/eslint-config'

export default defineConfig([
  ...tanstackConfig,
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
