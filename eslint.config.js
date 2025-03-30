import shlink from '@shlinkio/eslint-config-js-coding-standard';

export default [
  ...shlink,
  {
    // Allow config files and route files to have a default export, as that's what the third parties consuming them
    // expect
    files: ['**/app/routes/**', '**/app/routes.ts', '**/app/root.tsx', '*.config.{js,ts}'],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
];
