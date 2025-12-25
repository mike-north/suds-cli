import * as eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'

import * as tsdocPlugin from 'eslint-plugin-tsdoc'
import tseslint from 'typescript-eslint'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- plugin has no types
      tsdoc: tsdocPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'tsdoc/syntax': 'warn',
    },
  },
  {
    ignores: [
      '**/test/**',
      '**/vitest.config.*',
      'commitlint.config.cjs',
      'tools/demo-site/**',
    ],
  },
  {
    files: ['scripts/**/*.mts'],
  },
  // Prevent Node.js imports in packages (except machine) for browser compatibility
  {
    files: ['packages/*/src/**/*.ts'],
    ignores: ['packages/machine/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*'],
              message:
                'Node.js imports are not allowed. Use @suds-cli/machine abstractions instead.',
            },
            {
              group: ['fs', 'fs/*'],
              message:
                'Use @suds-cli/machine FileSystemAdapter instead of fs.',
            },
            {
              group: ['path'],
              message: 'Use @suds-cli/machine PathAdapter instead of path.',
            },
            {
              group: ['os'],
              message: 'Use @suds-cli/machine abstractions instead of os.',
            },
            {
              group: ['process'],
              message:
                'Use @suds-cli/machine PlatformAdapter instead of process.',
            },
            {
              group: ['buffer'],
              message:
                'Use @suds-cli/machine byte utilities instead of Buffer.',
            },
            {
              group: [
                'child_process',
                'cluster',
                'crypto',
                'dgram',
                'dns',
                'http',
                'http2',
                'https',
                'net',
                'readline',
                'stream',
                'tls',
                'tty',
                'url',
                'util',
                'v8',
                'vm',
                'worker_threads',
                'zlib',
              ],
              message:
                'Node.js imports are not allowed. Use @suds-cli/machine abstractions instead.',
            },
          ],
          paths: [
            {
              name: 'chalk',
              message:
                'Use @suds-cli/machine StyleAdapter instead of chalk.',
            },
            {
              name: 'supports-color',
              message:
                'Use @suds-cli/machine EnvironmentAdapter.getColorSupport() instead of supports-color.',
            },
          ],
        },
      ],
    },
  },
)
