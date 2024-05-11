import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Using a separate vitest config, so that we don't load the remix vite plugin during tests
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    allowOnly: true,
    environment: 'jsdom',
    environmentMatchGlobs: [
      ['**/*.server.test.{ts|tsx}', 'node'],
      ['*', 'jsdom'],
    ],
    setupFiles: './test/setup.ts',
    dir: 'test',
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: [
        'app/**/*.ts',
        'app/**/*.tsx',
        '!app/db/migrations/*.ts',
        '!app/entities/*.ts',
      ],
      reporter: ['text', 'text-summary', 'clover', 'html'],

      // Required code coverage. Lower than this will make the check fail
      // thresholds: {
      //   statements: 95,
      //   branches: 90,
      //   functions: 85,
      //   lines: 95,
      // },
    },
  },
});
