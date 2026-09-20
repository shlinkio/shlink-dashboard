import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { page as screen } from 'vitest/browser';
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
      await screen.getByRole('table').findElement();

      return result;
    };

    it.each(['admin' as const, 'advanced-user' as const])(
      'displays amount of users when logged-in user is an admin',
      async (role) => {
        await setUp({ role });
        const columns = [...screen.getByRole('table').element().querySelectorAll('th:not([aria-hidden="true"])')];

        // Users column is included only for admins
        expect(columns).toHaveLength(role === 'admin' ? 3 : 2);
      },
    );

    it('displays fallback message when there are no servers', async () => {
      await setUp();
      await expect.element(screen.getByText('No servers found')).toBeInTheDocument();
    });

    it('shows list of servers', async () => {
      const servers = [1, 2].map((id) =>
        fromPartial<ServerItem>({
          name: `Server ${id}`,
          publicId: `public_id_${id}`,
          baseUrl: `base_url_${id}`,
          usersCount: id,
        }),
      );
      const { user } = await setUp({ servers });
      const openRowMenu = async (serverName: string) =>
        await user.click(screen.getByLabelText(`Options for ${serverName}`));

      // We add 1 for the header row
      expect(screen.getByRole('row').all()).toHaveLength(servers.length + 1);

      await Promise.all(
        servers.map(async (server) => {
          await expect
            .element(screen.getByRole('link', { name: server.name }))
            .toHaveAttribute('href', `/server/${server.publicId}`);
          await expect.element(screen.getByRole('cell', { name: server.baseUrl })).toBeInTheDocument();
          await expect
            .element(screen.getByTestId(`users-count-${server.publicId}`))
            .toHaveTextContent(`${server.usersCount}`);

          await openRowMenu(server.name);
          await expect.element(screen.getByRole('menuitem', { name: 'Edit server' })).toBeInTheDocument();
          await expect.element(screen.getByRole('menuitem', { name: 'Delete server' })).toBeInTheDocument();
        }),
      );
    });

    it('has a link to go to server creation page', async () => {
      const { user } = await setUp();
      await user.click(screen.getByRole('link', { name: /Add a server/ }));

      await expect.element(screen.getByText('Server creation')).toBeInTheDocument();
    });

    it('initializes current search term', async () => {
      await setUp({ currentSearchTerm: 'something' });
      await expect.element(screen.getByRole('searchbox')).toHaveValue('something');
    });

    it('allows servers list to be filtered by search', async () => {
      const { user } = await setUp();
      await user.type(screen.getByRole('searchbox'), 'hello');

      // Search is deferred. It should eventually navigate to the URL with the search term
      await expect
        .poll(() => navigate)
        .toHaveBeenCalledWith(expect.stringContaining('search-term=hello'), { replace: true });
    });
  });
});
