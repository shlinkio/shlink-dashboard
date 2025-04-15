import { fromPartial } from '@total-typescript/shoehorn';
import { action } from '../../../app/routes/users/delete-user';
import type { UsersService } from '../../../app/users/UsersService.server';

describe('delete-user', () => {
  describe('action', () => {
    const deleteUser = vi.fn().mockResolvedValue(undefined);
    const usersService: UsersService = fromPartial({ deleteUser });
    const runAction = (userPublicId: string) => {
      const request = fromPartial<Request>({ json: vi.fn().mockResolvedValue({ userPublicId }) });
      return action(fromPartial({ request }), usersService);
    };

    it.each([['123', '456']])('deletes provided user by id', async (publicId) => {
      await runAction(publicId);
      expect(deleteUser).toHaveBeenCalledWith(publicId);
    });
  });
});
