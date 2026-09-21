import { render as vitestRender } from 'vitest-browser-react';
import { userEvent } from 'vitest/browser';

export const render = vitestRender;

export const renderWithEvents = async (...args: Parameters<typeof render>) => ({
  user: userEvent.setup(),
  ...(await render(...args)),
});

export type RenderWithEventsResult = Awaited<ReturnType<typeof renderWithEvents>>;
