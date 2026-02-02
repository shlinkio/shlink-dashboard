import { Collection } from '@mikro-orm/core';
import { fromPartial } from '@total-typescript/shoehorn';
import type { SessionData } from '../../../app/auth/session-context';
import type { PlainServer, Server } from '../../../app/entities/Server';
import type { Role, User } from '../../../app/entities/User';
import { loader } from '../../../app/routes/servers/list-servers';
import type { ServersService } from '../../../app/servers/ServersService.server';

describe('list-servers', () => {
  const createServer = ({ users = [], ...serverData }: Partial<PlainServer> & { users?: User[] }) => {
    const server = fromPartial<Server>(serverData);
    server.users = new Collection(server, users);
    return server;
  };

  describe('loader', () => {
    type RunLoader = {
      role: Role;
      publicId: string;
      queryString?: string;
      page?: string;
    };

    const getUserServers = vi.fn().mockResolvedValue([
      createServer({ name: 'server 1', users: [fromPartial({}), fromPartial({}), fromPartial({})] }),
      createServer({ name: 'server 2', users: [fromPartial({})] }),
    ]);
    const serversService: ServersService = fromPartial({ getUserServers });
    const runLoader = ({ role, publicId, queryString, page }: RunLoader) => loader(
      fromPartial({
        request: fromPartial({ url: `https://example.com/?${queryString}` }),
        context: { get: vi.fn().mockReturnValue(fromPartial<SessionData>({ role, publicId })) },
        params: { page },
      }),
      serversService,
    );

    it.each([
      {
        role: 'admin' as const,
        queryString: '',
        expectedPopulateUsers: true,
      },
      {
        role: 'admin' as const,
        queryString: 'no-users',
        expectedPopulateUsers: false,
      },
      {
        role: 'advanced-user' as const,
        queryString: '',
        expectedPopulateUsers: false,
      },
    ])('returns user counts when current user is an admin and it has not been explicitly disabled', async (
      { role, queryString, expectedPopulateUsers },
    ) => {
      const { servers } = await runLoader({ role, publicId: '123', queryString });

      expect(servers).toEqual([
        { name: 'server 1', usersCount: expectedPopulateUsers ? 3 : undefined },
        { name: 'server 2', usersCount: expectedPopulateUsers ? 1 : undefined },
      ]);
      expect(getUserServers).toHaveBeenCalledWith('123', expect.objectContaining({
        populateUsers: expectedPopulateUsers,
      }));
    });

    it('parses search term from query string', async () => {
      const { currentSearchTerm } = await runLoader(
        { role: 'advanced-user', publicId: '456', queryString: 'search-term=hello%20world' },
      );

      expect(getUserServers).toHaveBeenCalledWith('456', expect.objectContaining({ searchTerm: 'hello world' }));
      expect(currentSearchTerm).toEqual('hello world');
    });

    it.each([
      { page: undefined, expectedPage: 1, expectedItemsPerPage: undefined },
      { page: '3', expectedPage: 3, expectedItemsPerPage: undefined },
      { page: '41', queryString: 'items-per-page=75', expectedPage: 41, expectedItemsPerPage: 75 },
    ])('parses pagination params', async ({ page, queryString, expectedPage, expectedItemsPerPage }) => {
      await runLoader({ role: 'advanced-user', publicId: '789', page, queryString });
      expect(getUserServers).toHaveBeenCalledWith('789', expect.objectContaining({
        page: expectedPage,
        itemsPerPage: expectedItemsPerPage,
      }));
    });
  });
});
