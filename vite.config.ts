import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import stripExports from 'unplugin-strip-exports/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    // In a test env, load react plugin, not react router one
    process.env.NODE_ENV === 'test' ? react() : reactRouter(),
    tailwindcss(),
  ],

  build: {
    target: 'esnext',
  },

  server: {
    watch: {
      // Do not watch test files or generated files, avoiding the dev server to constantly reload when not needed
      ignored: ['**/.idea/**', '**/.git/**', '**/build/**', '**/coverage/**', '**/data/**', '**/test/**'],
    },
  },

  test: {
    globals: true,
    clearMocks: true,
    dir: 'test',
    setupFiles: './test/setup.ts',

    projects: [
      // Run component and client-specific tests in JSDOM environment
      {
        extends: true,
        test: {
          name: 'browser',
          include: ['**/*.client.test.{ts,tsx}', '**/[A-Z][a-zA-Z0-9]*.test.{ts,tsx}'],
          exclude: ['**/*.server.test.{ts,tsx}'],
          browser: {
            provider: playwright({
              // In CI, this instructs playwright to use a pre-existing Chrome instance
              launchOptions: process.env.CI ? { channel: 'chrome' } : undefined,
            }),
            enabled: true,
            headless: true,
            screenshotFailures: false,
            instances: [{ browser: 'chromium' }],
          },
        },
        plugins: [
          stripExports({
            // Strip all server-specific symbols from tests run in a browser.
            // This allows to test route components but making sure no server-specific imports are bundled.
            match: () => ['loader', 'action', 'middleware'],
          }),
        ],
      },
      // Run tests for server-only files in node environment
      {
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: ['**/*.server.test.{ts,tsx}'],
        },
      },
    ],

    coverage: {
      provider: 'v8',
      reportsDirectory: './coverage',
      include: ['app/**/*.ts', 'app/**/*.tsx', '!app/db/**/*.ts', '!app/entities/*.ts', '!app/routes.ts'],
      reporter: ['text', 'text-summary', 'clover', 'html'],

      // Required code coverage. Lower than this will make the check fail
      thresholds: {
        statements: 85,
        branches: 60,
        functions: 65,
        lines: 85,
      },
    },
  },
});
