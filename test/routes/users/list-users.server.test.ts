import { fromPartial } from '@total-typescript/shoehorn';
import type { LoaderFunctionArgs } from 'react-router';
import { loader } from '../../../app/routes/users/list-users';
import type { UsersService } from '../../../app/users/UsersService.server';

describe('list-users', () => {
  const listUsers = vi.fn();
  const usersService: UsersService = fromPartial({ listUsers });

  describe('loader', () => {
    const runLoader = (args: Partial<LoaderFunctionArgs> = {}) => loader(fromPartial(args), usersService);

    it('returns list of users with page if logged-in user is an admin', async () => {
      listUsers.mockResolvedValue(fromPartial({}));

      await runLoader({
        request: fromPartial({ url: 'https://example.com' }),
        params: { page: '5' },
      });

      expect(listUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 5 }));
    });
  });
});
