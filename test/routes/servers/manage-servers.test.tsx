import { Collection } from '@mikro-orm/core';
import { fromPartial } from '@total-typescript/shoehorn';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import type { SessionData } from '../../../app/auth/session-context';
import type { PlainServer, Server } from '../../../app/entities/Server';
import type { User } from '../../../app/entities/User';
import { loader } from '../../../app/routes/servers/manage-servers';
import type { ServersService } from '../../../app/servers/ServersService.server';

describe('manage-servers', () => {
  const createServer = ({ users = [], ...serverData }: Partial<PlainServer> & { users?: User[] }) => {
    const server = fromPartial<Server>(serverData);
    server.users = new Collection(server, users);
    return server;
  };

  describe('loader', () => {
    const getSession = vi.fn();
    const authHelper: AuthHelper = fromPartial({ getSession });
    const getUserServers = vi.fn().mockResolvedValue([
      createServer({ name: 'server 1', users: [fromPartial({}), fromPartial({}), fromPartial({})] }),
      createServer({ name: 'server 2', users: [fromPartial({})] }),
    ]);
    const serversService: ServersService = fromPartial({ getUserServers });
    const runLoader = () => loader(fromPartial({ request: fromPartial({}) }), authHelper, serversService);

    it('returns user counts when current user is an admin', async () => {
      getSession.mockResolvedValue(fromPartial<SessionData>({ role: 'admin', userId: '123' }));
      const result = await runLoader();

      expect(result).toEqual({
        servers: [
          { name: 'server 1', usersCount: 3 },
          { name: 'server 2', usersCount: 1 },
        ],
      });
      expect(getUserServers).toHaveBeenLastCalledWith('123', { populateUsers: true });
    });

    it('does not return user counts when current user is not an admin', async () => {
      getSession.mockResolvedValue(fromPartial<SessionData>({ role: 'advanced-user', userId: '456' }));
      const result = await runLoader();

      expect(result).toEqual({
        servers: [
          { name: 'server 1' },
          { name: 'server 2' },
        ],
      });
      expect(getUserServers).toHaveBeenLastCalledWith('456', { populateUsers: false });
    });
  });

  describe.todo('<ManageServers />');
});
