import { fromPartial } from '@total-typescript/shoehorn';
import { action } from '../../../app/routes/users/delete-user';
import type { UsersService } from '../../../app/users/UsersService.server';

describe('delete-user', () => {
  describe('action', () => {
    const deleteUser = vi.fn().mockResolvedValue(undefined);
    const usersService: UsersService = fromPartial({ deleteUser });
    const runAction = (userId: string) => {
      const request = fromPartial<Request>({ json: vi.fn().mockResolvedValue({ userId }) });
      return action(fromPartial({ request }), usersService);
    };

    it.each([['123', '456']])('deletes provided user by id', async (userId) => {
      await runAction(userId);
      expect(deleteUser).toHaveBeenCalledWith(userId);
    });
  });
});
