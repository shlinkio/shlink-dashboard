import { render as testingLibRender } from '@testing-library/react';
import { render as vitestRender } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

export const render = vitestRender;

export const renderWithEvents = (...args: Parameters<typeof render>) => ({
  user: userEvent.setup(),
  ...testingLibRender(...args),
});
