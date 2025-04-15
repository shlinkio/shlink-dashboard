import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { User } from '../../../app/entities/User';
import ResetUserPassword, { action, loader } from '../../../app/routes/users/reset-user-password';
import type { UsersService } from '../../../app/users/UsersService.server';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('reset-user-password', () => {
  const getUserById = vi.fn();
  const resetUserPassword = vi.fn();
  const usersService: UsersService = fromPartial({ getUserById, resetUserPassword });

  describe('loader', () => {
    const runLoader = () => loader(fromPartial({ params: { userPublicId: '123' } }), usersService);

    it('fetches user by ID', async () => {
      const expectedUser = fromPartial<User>({ id: '123', username: 'username' });
      getUserById.mockResolvedValue(expectedUser);

      const { user } = await runLoader();

      expect(user).toEqual(expectedUser);
    });
  });

  describe('action', () => {
    const runAction = () => action(fromPartial({ params: { userPublicId: '123' } }), usersService);

    it('resets user password by ID', async () => {
      const expectedUser = fromPartial<User>({ id: '123', username: 'username' });
      resetUserPassword.mockResolvedValue([expectedUser, 'the_new_password']);

      const { user, plainTextPassword } = await runAction();

      expect(user).toEqual(expectedUser);
      expect(plainTextPassword).toEqual('the_new_password');
    });
  });

  describe('<ResetUserPassword />', () => {
    const setUp = async () => {
      const path = '/manage-users/reset-password/123';
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
      await screen.findByText('Reset "john_doe" password');

      return result;
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('shows warning when page is loaded', async () => {
      await setUp();

      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Reset password' })).toBeInTheDocument();

      expect(screen.queryByRole('link', { name: 'Manage users' })).not.toBeInTheDocument();
      expect(screen.queryByText(/Their new temporary password is/)).not.toBeInTheDocument();
    });

    it('shows new password after resetting', async () => {
      const { user } = await setUp();

      const clickPromise = user.click(screen.getByRole('button', { name: 'Reset password' }));

      // Transitions to loading state first
      await waitFor(
        () => expect(screen.getByRole('button', { name: 'Resetting...', hidden: true })).toBeDisabled(),
      );
      expect(screen.getByRole('button', { name: 'Cancel', hidden: true })).toBeDisabled();

      // Eventually loads new section
      await clickPromise;
      await waitFor(() => expect(screen.getByRole('link', { name: 'Manage users' })).toBeInTheDocument());
      expect(screen.getByText(/Their new temporary password is/)).toBeInTheDocument();

      expect(screen.queryByText(/This action cannot be undone/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Reset password' })).not.toBeInTheDocument();
    });
  });
});
