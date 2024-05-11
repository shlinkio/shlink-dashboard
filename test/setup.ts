import '@testing-library/jest-dom/vitest';
import { installGlobals } from '@remix-run/node';
import axe from 'axe-core';

installGlobals();

axe.configure({
  checks: [
    {
      // Disable color contrast checking, as it doesn't work in jsdom
      id: 'color-contrast',
      enabled: false,
    },
  ],
});

if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (() => {}) as any;
}
