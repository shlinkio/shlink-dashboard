import '@testing-library/jest-dom/vitest';
import { installGlobals } from '@remix-run/node';
import axe from 'axe-core';

installGlobals();

// This is not defined when running tests in JSDOM.
// FIXME Server tests should be run in node though, instead of installing globals
if (typeof Response.json === 'undefined') {
  Response.json = (data: any, init: any) => new Response(JSON.stringify(data), init);
}

axe.configure({
  checks: [
    {
      // Disable color contrast checking, as it doesn't work in jsdom
      id: 'color-contrast',
      enabled: false,
    },
  ],
});

// Clears all mocks after every test
afterEach(() => {
  vi.clearAllMocks();
});

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => {}) as any;
}
