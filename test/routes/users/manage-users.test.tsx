import type { Order } from '@shlinkio/shlink-frontend-kit';
import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { LoaderFunctionArgs } from 'react-router';
import { createRoutesStub } from 'react-router';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import { SessionProvider } from '../../../app/auth/session-context';
import type { User } from '../../../app/entities/User';
import ManageUsers, { loader } from '../../../app/routes/users/manage-users';
import type { UserOrderableFields, UsersService } from '../../../app/users/UsersService.server';
import { checkAccessibility } from '../../__helpers__/accessibility';
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

describe('manage-users', () => {
  const getSession = vi.fn();
  const authHelper: AuthHelper = fromPartial({ getSession });
  const listUsers = vi.fn();
  const usersService: UsersService = fromPartial({ listUsers });
  const mockUser = (userData: Partial<Omit<User, 'id'>>): User => fromPartial({
    createdAt: new Date(),
    ...userData,
    id: crypto.randomUUID(),
  });

  describe('loader', () => {
    const runLoader = (args: Partial<LoaderFunctionArgs> = {}) => loader(fromPartial(args), authHelper, usersService);

    it('throws if logged-in user is not an admin', async () => {
      getSession.mockResolvedValue({ role: 'user' });

      await expect(() => runLoader()).rejects.toThrow(Response);
      expect(getSession).toHaveBeenCalled();
      expect(listUsers).not.toHaveBeenCalled();
    });

    it('returns list of users with page if logged-in user is an admin', async () => {
      getSession.mockResolvedValue({ role: 'admin' });
      listUsers.mockResolvedValue(fromPartial({}));

      await runLoader({
        request: fromPartial({ url: 'https://example.com' }),
        params: { page: '5' },
      });

      expect(getSession).toHaveBeenCalled();
      expect(listUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 5 }));
    });
  });

  describe('<ManageUsers />', () => {
    type SetUpOptions = {
      users?: User[];
      totalPages?: number;
      orderBy?: Order<UserOrderableFields>;
      searchTerm?: string;
      currentUsername?: string;
    };

    const setUp = async (
      { users = [], totalPages = 1, orderBy = {}, searchTerm, currentUsername }: SetUpOptions = {},
    ) => {
      const Stub = createRoutesStub([
        {
          path: '/manage-users/1',
          Component: (props) => (
            <SessionProvider value={currentUsername ? fromPartial({ username: currentUsername }) : null}>
              <ManageUsers {...props} />
            </SessionProvider>
          ),
          HydrateFallback: () => null,
          loader: () => ({
            users,
            totalPages,
            currentParams: {
              page: 1,
              orderBy,
              searchTerm,
            },
          }),
        },
        {
          path: '/manage-users/create',
          Component: () => <>Create user</>,
        },
        {
          path: '/manage-users/edit/123',
          Component: () => <>Edit user</>,
        },
      ]);
      const renderResult = renderWithEvents(<Stub initialEntries={['/manage-users/1']} />);

      // Wait for the table to be rendered
      await screen.findByRole('table');

      return renderResult;
    };

    it.each([
      {},
      { users: [mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' })] },
      { users: [mockUser({ username: 'foo', role: 'admin' })] },
      { totalPages: 5 },
    ])('passes a11y checks', async ({ users, totalPages }) => checkAccessibility(setUp({ users, totalPages })));

    it('renders empty users list if no users are returned', async () => {
      await setUp();

      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.queryByTestId('paginator')).not.toBeInTheDocument();
    });

    it('renders list with returned users', async () => {
      await setUp({
        users: [mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' })],
        totalPages: 5,
      });

      expect(screen.queryByText('No users found')).not.toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('paginator')).toBeInTheDocument();
    });

    it.each([
      { orderBy: undefined, expectedOrderedColumn: 'Created' },
      {
        orderBy: { field: 'createdAt' as const },
        expectedOrderedColumn: 'Created',
      },
      {
        orderBy: { field: 'username' as const, dir: 'DESC' as const },
        expectedOrderedColumn: 'Username',
      },
      {
        orderBy: { field: 'displayName' as const, dir: 'ASC' as const },
        expectedOrderedColumn: 'Display name',
      },
      {
        orderBy: { field: 'role' as const, dir: 'ASC' as const },
        expectedOrderedColumn: 'Role',
      },
    ])('marks expected column as ordered', async ({ orderBy, expectedOrderedColumn }) => {
      await setUp({ orderBy });
      const column = screen.getByText(expectedOrderedColumn);

      expect(column.parentElement?.querySelector('svg')).toBeInTheDocument();
    });

    it.each([
      {
        orderBy: undefined,
        expectedUrls: {
          'Created': 'orderBy=createdAt-DESC',
          'Username': 'orderBy=username-ASC',
          'Display name': 'orderBy=displayName-ASC',
          'Role': 'orderBy=role-ASC',
        },
      },
      {
        orderBy: {
          field: 'username' as const,
          dir: 'DESC' as const,
        },
        expectedUrls: {
          'Created': 'orderBy=createdAt-ASC',
          // 'Username': 'orderBy=username-ASC', TODO Fix this
          'Display name': 'orderBy=displayName-ASC',
          'Role': 'orderBy=role-ASC',
        },
      },
      {
        orderBy: {
          field: 'displayName' as const,
          dir: 'ASC' as const,
        },
        expectedUrls: {
          'Created': 'orderBy=createdAt-ASC',
          'Username': 'orderBy=username-ASC',
          'Display name': 'orderBy=displayName-DESC',
          'Role': 'orderBy=role-ASC',
        },
      },
    ])('includes order in header URLs', async ({ orderBy, expectedUrls }) => {
      await setUp({ totalPages: 10, orderBy });

      Object.entries(expectedUrls).forEach(([linkText, expectedUrl]) => {
        expect(screen.getByRole('link', { name: linkText })).toHaveAttribute('href', `/manage-users/1?${expectedUrl}`);
      });
    });

    it('sets current search term in search input', async () => {
      await setUp({ searchTerm: 'Hello' });
      expect(screen.getByRole('searchbox')).toHaveValue('Hello');
    });

    it('navigates to search term when typing in search box', async () => {
      const { user } = await setUp();

      await user.type(screen.getByRole('searchbox'), 'hello');

      // It should eventually navigate to the URL with the search term
      await waitFor(
        () => expect(navigate).toHaveBeenCalledWith(expect.stringContaining('searchTerm=hello'), { replace: true }),
      );
    });

    it('redirects to create user form', async () => {
      const { user } = await setUp();

      await user.click(screen.getByRole('link', { name: /New user$/ }));
      await waitFor(() => expect(screen.getByText('Create user')).toBeInTheDocument());
    });

    it('shows interaction buttons only for users other than current one', async () => {
      const users = [
        mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' }),
        mockUser({ username: 'bar', displayName: 'John Doe', role: 'advanced-user' }),
        mockUser({ username: 'current', displayName: 'John Doe', role: 'admin' }),
        mockUser({ username: 'baz', displayName: 'John Doe', role: 'managed-user' }),
      ];
      await setUp({ currentUsername: 'current', users });

      expect(screen.getAllByLabelText(/^Delete user/)).toHaveLength(3);
      expect(screen.getByLabelText('Delete user foo')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete user bar')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete user baz')).toBeInTheDocument();
      expect(screen.queryByLabelText('Delete user current')).not.toBeInTheDocument();

      expect(screen.getAllByLabelText(/^Edit user/)).toHaveLength(3);
      expect(screen.getByLabelText('Edit user foo')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit user bar')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit user baz')).toBeInTheDocument();
      expect(screen.queryByLabelText('Edit user current')).not.toBeInTheDocument();
    });

    it('shows information about the user to be deleted', async () => {
      const { user } = await setUp({
        users: [
          mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' }),
          mockUser({ username: 'bar', displayName: 'John Doe', role: 'advanced-user' }),
        ],
      });

      expect(screen.queryByText(/^Are you sure you want to delete user/)).not.toBeInTheDocument();

      await user.click(screen.getByLabelText('Delete user foo'));
      expect(screen.getByText(/^Are you sure you want to delete user/)).toHaveTextContent(/foo/);
      await user.click(screen.getByText('Cancel'));

      await user.click(screen.getByLabelText('Delete user bar'));
      expect(screen.getByText(/^Are you sure you want to delete user/)).toHaveTextContent(/bar/);
    });
  });
});
