import shlink from '@shlinkio/eslint-config-js-coding-standard';

/* eslint-disable-next-line no-restricted-exports */
export default [
  ...shlink,
  {
    files: ['**/app/routes/**', '**/app/root.tsx', 'vite*.config.ts'],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
];
