import type { Order } from '@shlinkio/shlink-frontend-kit';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { page as screen } from 'vitest/browser';
import type { UserEvent } from 'vitest/browser';
import { SessionProvider } from '../../../app/auth/session-context';
import type { User } from '../../../app/entities/User';
import ListUsers from '../../../app/routes/users/list-users';
import type { UserOrderableFields } from '../../../app/users/UsersService.server';
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

type SetUpOptions = {
  users?: User[];
  totalPages?: number;
  orderBy?: Order<UserOrderableFields>;
  searchTerm?: string;
  currentUsername?: string;
};

describe('list-users', () => {
  describe('<ListUsers />', () => {
    const mockUser = (userData: Partial<Omit<User, 'publicId'>>): User =>
      fromPartial({
        createdAt: new Date(),
        ...userData,
        publicId: crypto.randomUUID(),
      });

    const setUp = async ({
      users = [],
      totalPages = 1,
      orderBy = {},
      searchTerm,
      currentUsername,
    }: SetUpOptions = {}) => {
      const Stub = createRoutesStub([
        {
          path: '/manage-users/1',
          Component: (props) => (
            <SessionProvider value={currentUsername ? fromPartial({ username: currentUsername }) : null}>
              <ListUsers {...props} />
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
          path: '/manage-users/123/edit',
          Component: () => <>Edit user</>,
        },
      ]);
      const renderResult = renderWithEvents(<Stub initialEntries={['/manage-users/1']} />);

      // Wait for the table to be rendered
      await screen.getByRole('table').findElement();

      return renderResult;
    };

    const openDropdown = async (user: UserEvent, username: string) =>
      user.click(screen.getByLabelText(`Options for ${username}`));

    it.each([
      {},
      { users: [mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' })] },
      { users: [mockUser({ username: 'foo', role: 'admin' })] },
      { totalPages: 5 },
    ])('passes a11y checks', async ({ users, totalPages }) => checkAccessibility(setUp({ users, totalPages })));

    it('renders empty users list if no users are returned', async () => {
      await setUp();

      await expect.element(screen.getByText('No users found')).toBeInTheDocument();
      await expect.element(screen.getByTestId('paginator')).not.toBeInTheDocument();
    });

    it('renders list with returned users', async () => {
      await setUp({
        users: [mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' })],
        totalPages: 5,
      });

      await expect.element(screen.getByText('No users found')).not.toBeInTheDocument();
      await expect.element(screen.getByText('John Doe')).toBeInTheDocument();
      await expect.element(screen.getByTestId('paginator')).toBeInTheDocument();
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
      const parentElement = column.element().parentElement;

      if (!parentElement) {
        throw new Error('Parent element not set');
      }

      await expect.element(parentElement.querySelector('svg')).toBeInTheDocument();
    });

    it.each([
      {
        orderBy: undefined,
        expectedUrls: {
          Created: 'order-by=createdAt-DESC',
          Username: 'order-by=username-ASC',
          'Display name': 'order-by=displayName-ASC',
          Role: 'order-by=role-ASC',
        },
      },
      {
        orderBy: {
          field: 'username' as const,
          dir: 'DESC' as const,
        },
        expectedUrls: {
          Created: 'order-by=createdAt-ASC',
          // 'Username': 'order-by=username-ASC', TODO Fix this
          'Display name': 'order-by=displayName-ASC',
          Role: 'order-by=role-ASC',
        },
      },
      {
        orderBy: {
          field: 'displayName' as const,
          dir: 'ASC' as const,
        },
        expectedUrls: {
          Created: 'order-by=createdAt-ASC',
          Username: 'order-by=username-ASC',
          'Display name': 'order-by=displayName-DESC',
          Role: 'order-by=role-ASC',
        },
      },
    ])('includes order in header URLs', async ({ orderBy, expectedUrls }) => {
      await setUp({ totalPages: 10, orderBy });

      await Promise.all(
        Object.entries(expectedUrls).map(([linkText, expectedUrl]) =>
          expect
            .element(screen.getByRole('link', { name: linkText }))
            .toHaveAttribute('href', `/manage-users/1?${expectedUrl}`),
        ),
      );
    });

    it('sets current search term in search input', async () => {
      await setUp({ searchTerm: 'Hello' });
      await expect.element(screen.getByRole('searchbox')).toHaveValue('Hello');
    });

    it('navigates to search term when typing in search box', async () => {
      const { user } = await setUp();

      await user.type(screen.getByRole('searchbox'), 'hello');

      // It should eventually navigate to the URL with the search term
      await expect
        .poll(() => navigate)
        .toHaveBeenCalledWith(expect.stringContaining('search-term=hello'), { replace: true });
    });

    it('redirects to create user form', async () => {
      const { user } = await setUp();

      await user.click(screen.getByRole('link', { name: /New user$/ }));
      await expect.element(screen.getByText('Create user')).toBeInTheDocument();
    });

    it.each([
      { username: 'foo', shouldHaveServers: false },
      { username: 'bar', shouldHaveServers: false },
      { username: 'baz', shouldHaveServers: true },
    ])('shows interaction buttons only for users other than current one', async ({ username, shouldHaveServers }) => {
      const users = [
        mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' }),
        mockUser({ username: 'bar', displayName: 'John Doe', role: 'advanced-user' }),
        mockUser({ username: 'current', displayName: 'John Doe', role: 'admin' }),
        mockUser({ username: 'baz', displayName: 'John Doe', role: 'managed-user' }),
      ];
      const { user } = await setUp({ currentUsername: 'current', users });

      await openDropdown(user, username);
      await expect.element(screen.getByRole('menuitem', { name: 'Delete' })).toBeInTheDocument();
      await expect.element(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      await expect.element(screen.getByRole('menuitem', { name: 'Reset password' })).toBeInTheDocument();

      if (shouldHaveServers) {
        await expect.element(screen.getByRole('menuitem', { name: 'Servers' })).toBeInTheDocument();
      } else {
        await expect.element(screen.getByRole('menuitem', { name: 'Servers' })).not.toBeInTheDocument();
      }

      await expect.element(screen.getByLabelText('Options for current')).not.toBeInTheDocument();
    });

    it.each([
      { username: 'foo', expectedText: /foo/ },
      { username: 'bar', expectedText: /bar/ },
    ])('shows information about the user to be deleted', async ({ username, expectedText }) => {
      const { user } = await setUp({
        users: [
          mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' }),
          mockUser({ username: 'bar', displayName: 'John Doe', role: 'advanced-user' }),
        ],
      });

      await expect.element(screen.getByText(/^Are you sure you want to delete user/)).not.toBeInTheDocument();

      await openDropdown(user, username);
      await user.click(screen.getByRole('menuitem', { name: 'Delete' }));

      await expect.element(screen.getByText(/^Are you sure you want to delete user/)).toHaveTextContent(expectedText);

      await user.click(screen.getByText('Cancel'));
    });
  });
});
