import { Collection } from '@mikro-orm/core';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { SessionData } from '../../../app/auth/session-context';
import { SessionProvider } from '../../../app/auth/session-context';
import type { PlainServer, Server } from '../../../app/entities/Server';
import type { Role, User } from '../../../app/entities/User';
import ListServers, { loader } from '../../../app/routes/servers/list-servers';
import type { ServersService } from '../../../app/servers/ServersService.server';
import { renderWithEvents } from '../../__helpers__/set-up-test';

// Mock the useNavigate hook so that we can test programmatic navigations
const navigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: vi.fn(() => navigate),
  };
});

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

  describe('<ListServers />', () => {
    type ServerItem = PlainServer & { usersCount?: number };
    type SetUpOptions = {
      servers?: ServerItem[];
      role?: Role;
      currentSearchTerm?: string;
    };

    const setUp = async ({ role, servers = [], currentSearchTerm }: SetUpOptions = {}) => {
      const path = '/manage-users/1';
      const Stub = createRoutesStub([
        {
          path,
          Component: (props) => (
            <SessionProvider value={fromPartial({ role })}>
              <ListServers {...props} />
            </SessionProvider>
          ),
          HydrateFallback: () => null,
          loader: () => ({ servers, currentSearchTerm }),
        },
        {
          path: '/manage-servers/create',
          Component: () => <>Server creation</>,
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[path]} />);

      // Wait for the table to render before returning...
      await screen.findByRole('table');

      return result;
    };

    it.each([
      'admin' as const,
      'advanced-user' as const,
    ])('displays amount of users when logged-in user is an admin', async (role) => {
      await setUp({ role });

      if (role === 'admin') {
        expect(screen.getAllByRole('columnheader')).toHaveLength(3);
        expect(screen.getByRole('columnheader', { name: 'Users' })).toBeInTheDocument();
      } else {
        expect(screen.getAllByRole('columnheader')).toHaveLength(2);
        expect(screen.queryByRole('columnheader', { name: 'Users' })).not.toBeInTheDocument();
      }
    });

    it('displays fallback message when there are no servers', async () => {
      await setUp();
      expect(screen.getByText('No servers found')).toBeInTheDocument();
    });

    it('shows list of servers', async () => {
      const servers = [1, 2].map((id) => fromPartial<ServerItem>({
        name: `Server ${id}`,
        publicId: `public_id_${id}`,
        baseUrl: `base_url_${id}`,
        usersCount: id,
      }));
      const { user } = await setUp({ servers });
      const openRowMenu = async (serverName: string) => await user.click(
        screen.getByLabelText(`Options for ${serverName}`),
      );

      // We add 1 for the header row
      expect(screen.getAllByRole('row')).toHaveLength(servers.length + 1);

      await Promise.all(servers.map(async (server) => {
        expect(screen.getByRole('link', { name: server.name })).toHaveAttribute('href', `/server/${server.publicId}`);
        expect(screen.getByRole('cell', { name: server.baseUrl })).toBeInTheDocument();
        expect(screen.getByTestId(`users-count-${server.publicId}`)).toHaveTextContent(`${server.usersCount}`);

        await openRowMenu(server.name);
        expect(screen.getByRole('menuitem', { name: 'Edit server' })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: 'Delete server' })).toBeInTheDocument();
      }));
    });

    it('has a link to go to server creation page', async () => {
      const { user } = await setUp();
      await user.click(screen.getByRole('link', { name: /Add a server/ }));

      expect(screen.getByText('Server creation'));
    });

    it('initializes current search term', async () => {
      await setUp({ currentSearchTerm: 'something' });
      expect(screen.getByRole('searchbox')).toHaveValue('something');
    });

    it('allows servers list to be filtered by search', async () => {
      const { user } = await setUp();
      await user.type(screen.getByRole('searchbox'), 'hello');

      // Search is deferred. It should eventually navigate to the URL with the search term
      await waitFor(
        () => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('search-term=hello'), { replace: true }),
      );
    });
  });
});
