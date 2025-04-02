import '@testing-library/jest-dom/vitest';
import axe from 'axe-core';

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

HTMLDialogElement.prototype.showModal = function() {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function() {
  this.removeAttribute('open');
  this.dispatchEvent(new CloseEvent('close'));
  this.dispatchEvent(new CloseEvent('cancel'));
};
