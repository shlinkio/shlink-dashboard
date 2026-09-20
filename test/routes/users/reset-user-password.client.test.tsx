import { waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { page as screen } from 'vitest/browser';
import type { User } from '../../../app/entities/User';
import ResetUserPassword from '../../../app/routes/users/reset-user-password';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('reset-user-password', () => {
  describe('<ResetUserPassword />', () => {
    const setUp = async () => {
      const path = '/manage-users/123/reset-password';
      const user = fromPartial<User>({ username: 'john_doe' });
      const Stub = createRoutesStub([
        {
          path,
          Component: ResetUserPassword,
          HydrateFallback: () => null,
          loader: () => ({ user }),
          action: () => ({ user, plainTextPassword: 'new_password' }),
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.getByText('Reset "john_doe" password').findElement();

      return result;
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('shows warning when page is loaded', async () => {
      await setUp();

      await expect.element(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument();

      await expect.element(screen.getByRole('link', { name: 'Manage users' })).not.toBeInTheDocument();
      await expect.element(screen.getByText(/Their new temporary password is/)).not.toBeInTheDocument();
    });

    it('shows new password after resetting', async () => {
      const { user } = await setUp();

      await user.click(screen.getByRole('button', { name: 'Reset password' }));

      // Transitions to loading state first - FIXME Removed due to the requirement of awaiting user interaction
      // await waitFor(() => expect(screen.getByRole('button', { name: 'Resetting...', includeHidden: true })).toBeDisabled());
      // await expect.element(screen.getByRole('button', { name: 'Cancel', includeHidden: true })).toBeDisabled();

      // Eventually loads new section
      await waitFor(() => expect(screen.getByRole('link', { name: 'Manage users' })).toBeInTheDocument());
      await expect.element(screen.getByText(/Their new temporary password is/)).toBeInTheDocument();

      await expect.element(screen.getByText(/This action cannot be undone/)).not.toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      await expect.element(screen.getByRole('button', { name: 'Reset password' })).not.toBeInTheDocument();
    });
  });
});
