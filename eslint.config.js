import shlink from '@shlinkio/eslint-config-js-coding-standard';
import reactCompiler from 'eslint-plugin-react-compiler';

// eslint-disable-next-line no-restricted-exports
export default [
  ...shlink,
  reactCompiler.configs.recommended,
  {
    // Allow config files and route files to have a default export, as that's what the third parties consuming them
    // expect
    files: ['**/app/routes/**', '**/app/routes.ts', '**/app/root.tsx', '*.config.ts'],
    rules: {
      'no-restricted-exports': 'off',
    },
  },
];
