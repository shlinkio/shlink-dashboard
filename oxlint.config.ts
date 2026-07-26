// @ts-expect-error This lib does not expose type definitions
import shlink from '@shlinkio/eslint-config-js-coding-standard/oxc/oxlint';
import { defineConfig } from 'oxlint';

export default defineConfig({
  extends: [shlink],
  overrides: [
    {
      // Allow config files and route files to have a default export, as that's what the third parties consuming them
      // expect
      files: ['**/app/routes/**', '**/app/routes.ts', '**/app/root.tsx', '*.config.ts'],
      rules: {
        'eslint/no-restricted-exports': 'off',
      },
    },
    {
      files: ['**/*.test.*'],
      rules: {
        'typescript/no-floating-promises': 'off',
        'typescript/unbound-method': 'off',
      },
    },
  ],
});
