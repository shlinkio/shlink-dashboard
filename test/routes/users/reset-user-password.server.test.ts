import { fromPartial } from '@total-typescript/shoehorn';
import type { User } from '../../../app/entities/User';
import { action, loader } from '../../../app/routes/users/reset-user-password';
import type { UsersService } from '../../../app/users/UsersService.server';

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
});
