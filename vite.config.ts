import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';

const DEFAULT_NODE_VERSION = 'v22.10.0';
const nodeVersion = process.version ?? DEFAULT_NODE_VERSION;

export default defineConfig({
  plugins: [
    // In a test env, load react plugin, not react router one
    process.env.NODE_ENV === 'test' ? react() : reactRouter(),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
  },

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
        '!app/routes.ts',
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

    // Workaround for bug in react-router (or vitest module resolution) which causes different react-router versions to
    // be resolved for the main package and dependencies who have a peer dependency in react-router.
    // This ensures always the same version is resolved.
    // See https://github.com/remix-run/react-router/issues/12785 for details
    alias: nodeVersion > DEFAULT_NODE_VERSION
      ? {
        'react-router': resolve(__dirname, 'node_modules/react-router/dist/development/index.mjs'),
      }
      : undefined,
  },
});
