import { Collection } from '@mikro-orm/core';
import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { SessionData } from '../../../app/auth/session-context';
import { SessionProvider } from '../../../app/auth/session-context';
import type { PlainServer, Server } from '../../../app/entities/Server';
import type { Role, User } from '../../../app/entities/User';
import ListServers, { loader } from '../../../app/routes/servers/list-servers';
import type { ServersService } from '../../../app/servers/ServersService.server';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('list-servers', () => {
  const createServer = ({ users = [], ...serverData }: Partial<PlainServer> & { users?: User[] }) => {
    const server = fromPartial<Server>(serverData);
    server.users = new Collection(server, users);
    return server;
  };

  describe('loader', () => {
    const getUserServers = vi.fn().mockResolvedValue([
      createServer({ name: 'server 1', users: [fromPartial({}), fromPartial({}), fromPartial({})] }),
      createServer({ name: 'server 2', users: [fromPartial({})] }),
    ]);
    const serversService: ServersService = fromPartial({ getUserServers });
    const runLoader = (contextData: SessionData) => loader(
      fromPartial({
        context: { get: vi.fn().mockReturnValue(contextData) },
      }),
      serversService,
    );

    it('returns user counts when current user is an admin', async () => {
      const result = await runLoader(fromPartial({ role: 'admin', userId: '123' }));

      expect(result).toEqual({
        servers: [
          { name: 'server 1', usersCount: 3 },
          { name: 'server 2', usersCount: 1 },
        ],
      });
      expect(getUserServers).toHaveBeenLastCalledWith('123', { populateUsers: true });
    });

    it('does not return user counts when current user is not an admin', async () => {
      const result = await runLoader(fromPartial({ role: 'advanced-user', userId: '456' }));

      expect(result).toEqual({
        servers: [
          { name: 'server 1' },
          { name: 'server 2' },
        ],
      });
      expect(getUserServers).toHaveBeenLastCalledWith('456', { populateUsers: false });
    });
  });

  describe('<ListServers />', () => {
    type ServerItem = PlainServer & { usersCount?: number };
    type SetUpOptions = {
      servers?: ServerItem[];
      role?: Role;
    };

    const setUp = async ({ role, servers = [] }: SetUpOptions = {}) => {
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
          loader: () => ({ servers }),
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
      await setUp({ servers });

      // We add 1 for the header row
      expect(screen.getAllByRole('row')).toHaveLength(servers.length + 1);

      servers.forEach((server) => {
        expect(screen.getByRole('link', { name: server.name })).toHaveAttribute('href', `/server/${server.publicId}`);
        expect(screen.getByRole('cell', { name: server.baseUrl })).toBeInTheDocument();
        expect(screen.getByTestId(`users-count-${server.publicId}`)).toHaveTextContent(`${server.usersCount}`);
        expect(screen.getByLabelText(`Delete server ${server.name}`)).toBeInTheDocument();
      });
    });

    it('has a link to go to server creation page', async () => {
      const { user } = await setUp();
      await user.click(screen.getByRole('link', { name: /Add a server/ }));

      expect(screen.getByText('Server creation'));
    });
  });
});
