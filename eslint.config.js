import shlink from '@shlinkio/eslint-config-js-coding-standard';
import tseslint from 'typescript-eslint';

/* eslint-disable-next-line no-restricted-exports */
export default tseslint.config(...shlink, {
  files: ['**/app/routes/**', '**/app/root.tsx', 'vite*.config.ts'],
  rules: {
    'no-restricted-exports': 'off',
  },
});
