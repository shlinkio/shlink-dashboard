import { fromPartial } from '@total-typescript/shoehorn';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import { action } from '../../../app/routes/users/delete-user';
import type { UsersService } from '../../../app/users/UsersService.server';

describe('delete-user', () => {
  describe('action', () => {
    const deleteUser = vi.fn().mockResolvedValue(undefined);
    const usersService: UsersService = fromPartial({ deleteUser });
    const getSession = vi.fn().mockResolvedValue({ role: 'admin' });
    const authHelper: AuthHelper = fromPartial({ getSession });
    const runAction = (userId: string) => {
      const request = fromPartial<Request>({ json: vi.fn().mockResolvedValue({ userId }) });
      return action(fromPartial({ request }), usersService, authHelper);
    };

    it.each([['123', '456']])('deletes provided user by id', async (userId) => {
      await runAction(userId);
      expect(deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
