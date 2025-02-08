import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Using a separate vitest config, so that we don't load the remix vite plugin during tests
export default defineConfig({
  plugins: [react()],

  test: {
    globals: true,
    allowOnly: true,
    workspace: [
      // Run tests for server-only files in node environment
      {
        extends: true,
        test: {
          environment: 'node',
          include: ['**/*.server.test.{ts|tsx}'],
        },
      },
      // Run rest of tests in JSDOM environment
      {
        extends: true,
        test: {
          environment: 'jsdom',
        },
      },
    ],
    setupFiles: './test/setup.ts',
    dir: 'test',
    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: [
        'app/**/*.ts',
        'app/**/*.tsx',
        '!app/db/**/*.ts',
        '!app/entities/*.ts',
      ],
      reporter: ['text', 'text-summary', 'clover', 'html'],

      // Required code coverage. Lower than this will make the check fail
      thresholds: {
        statements: 80,
        branches: 95,
        functions: 90,
        lines: 80,
      },
    },
  },
});
