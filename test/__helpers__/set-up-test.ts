import { render } from '@testing-library/react';
import { userEvent } from 'vitest/browser';

export const renderWithEvents = (...args: Parameters<typeof render>) => ({
  user: userEvent.setup(),
  ...render(...args),
});
