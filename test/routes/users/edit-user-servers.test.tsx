import { fromPartial } from '@total-typescript/shoehorn';
import type { User } from '../../../app/entities/User';
import { action, loader } from '../../../app/routes/users/edit-user-servers';
import type { ServersService } from '../../../app/servers/ServersService.server';
import type { UsersService } from '../../../app/users/UsersService.server';

describe('edit-user-servers', () => {
  const getUserServers= vi.fn().mockResolvedValue([]);
  const setServersForUser= vi.fn().mockResolvedValue(undefined);
  const serversService: ServersService = fromPartial({ getUserServers, setServersForUser });

  describe('loader', () => {
    const getUserById = vi.fn();
    const usersService: UsersService = fromPartial({ getUserById });
    const runLoader = () => loader(fromPartial({
      params: { userId: '' },
    }), serversService, usersService);

    it('fetches servers and user', async () => {
      const user = fromPartial<User>({ role: 'managed-user' });
      getUserById.mockResolvedValue(user);

      const result = await runLoader();

      expect(result).toEqual({ servers: [], user });
      expect(getUserServers).toHaveBeenCalledOnce();
      expect(getUserById).toHaveBeenCalledOnce();
    });

    it.each([
      'admin' as const,
      'advanced-user' as const,
    ])('throws when trying to edit servers for a non-managed user', async (role) => {
      const user = fromPartial<User>({ role });
      getUserById.mockResolvedValue(user);

      await expect(runLoader()).rejects.toThrow(expect.objectContaining({
        status: 400,
      }));
      expect(getUserServers).toHaveBeenCalledOnce();
      expect(getUserById).toHaveBeenCalledOnce();
    });
  });

  describe('action', () => {
    const runAction = () => action(fromPartial({
      params: { userId: '123' },
      request: { formData: vi.fn().mockResolvedValue(new FormData()) },
    }), serversService);

    it('sets servers and redirects to servers list', async () => {
      const response = await runAction();

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual('/manage-users/1');
      expect(setServersForUser).toHaveBeenCalledWith('123', new FormData());
    });
  });

  describe.todo('<EditUserServers />');
});
