import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export const renderWithEvents = (...args: Parameters<typeof render>) => ({
  user: userEvent.setup(),
  ...render(...args),
});
