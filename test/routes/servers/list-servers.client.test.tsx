import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { SessionProvider } from '../../../app/auth/session-context';
import type { PlainServer } from '../../../app/entities/Server';
import type { Role } from '../../../app/entities/User';
import ListServers from '../../../app/routes/servers/list-servers';
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
