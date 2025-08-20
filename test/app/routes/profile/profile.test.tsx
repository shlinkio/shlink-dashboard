import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { UNSAFE_DataWithResponseInit } from 'react-router';
import { createRoutesStub } from 'react-router';
import type { AuthHelper } from '../../../../app/auth/auth-helper.server';
import { SessionProvider } from '../../../../app/auth/session-context';
import type { User } from '../../../../app/entities/User';
import Profile, { action } from '../../../../app/routes/profile/profile';
import { CHANGE_PASSWORD_ACTION, PROFILE_ACTION } from '../../../../app/users/user-profile-actions';
import type { UsersService } from '../../../../app/users/UsersService.server';

describe('profile', () => {
  describe('action', () => {
    const editUserPassword = vi.fn();
    const editUser = vi.fn().mockResolvedValue({
      user: fromPartial<User>({ displayName: 'The display name' }),
    });
    const usersService: UsersService = fromPartial({ editUser, editUserPassword });
    const updateSession = vi.fn();
    const authHelper: AuthHelper = fromPartial({ updateSession });
    const runAction = (profileAction: string) => action(fromPartial({
      context: { get: () => ({}) },
      request: {
        url: `http://example.com?action=${profileAction}`,
        formData: vi.fn().mockResolvedValue(new FormData()),
      },
    }), usersService, authHelper);

    it('edits user when action is PROFILE_ACTION', async () => {
      await runAction(PROFILE_ACTION);

      expect(editUser).toHaveBeenCalled();
      expect(updateSession).toHaveBeenCalled();
      expect(editUserPassword).not.toHaveBeenCalled();
    });

    it('edits password when action is CHANGE_PASSWORD_ACTION', async () => {
      await runAction(CHANGE_PASSWORD_ACTION);

      expect(editUserPassword).toHaveBeenCalled();
      expect(editUser).not.toHaveBeenCalled();
      expect(updateSession).not.toHaveBeenCalled();
    });

    it('updates session when action is PROFILE_ACTION', async () => {
      updateSession.mockResolvedValue('the_cookie');

      const response = await runAction(PROFILE_ACTION);
      expect((response as UNSAFE_DataWithResponseInit<any>).init?.headers).toEqual({ 'Set-Cookie': 'the_cookie' });
    });
  });

  describe('<Profile />', () => {
    const setUp = () => {
      const path = '/profile';
      const Stub = createRoutesStub([{
        path,
        Component: Profile,
        HydrateFallback: () => null,
      }]);

      return render(
        <SessionProvider value={fromPartial({})}>
          <Stub initialEntries={[path]} />
        </SessionProvider>,
      );
    };

    it('renders both forms', async () => {
      setUp();

      expect(screen.getByText('Edit profile')).toBeInTheDocument();
      expect(screen.getByText('Change password')).toBeInTheDocument();
    });
  });
});
