import type { Order } from '@shlinkio/shlink-frontend-kit';
import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { LoaderFunctionArgs } from 'react-router';
import { createRoutesStub } from 'react-router';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import type { User } from '../../../app/entities/User';
import ManageUsers, { loader } from '../../../app/routes/users/manage-users';
import type { UserOrderableFields, UsersService } from '../../../app/users/UsersService.server';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('manage-users', () => {
  const getSession = vi.fn();
  const authHelper: AuthHelper = fromPartial({ getSession });
  const listUsers = vi.fn();
  const usersService: UsersService = fromPartial({ listUsers });
  const mockUser = (userData: Partial<Omit<User, 'id'>>): User => fromPartial({
    createdAt: new Date(),
    ...userData,
    id: `${Date.now()}`,
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
        params: { page: '5' },
      });

      expect(getSession).toHaveBeenCalled();
      expect(listUsers).toHaveBeenCalledWith({ page: 5 });
    });
  });

  describe('<ManageUsers />', () => {
    type SetUpOptions = {
      users?: User[];
      totalPages?: number;
      orderBy?: Order<UserOrderableFields>;
    };

    const setUp = ({ users = [], totalPages = 1, orderBy = {} }: SetUpOptions = {}) => {
      const Stub = createRoutesStub([
        {
          path: '/users/manage/1',
          Component: ManageUsers,
          loader: () => ({ users, totalPages, orderBy }),
        },
      ]);
      return render(<Stub initialEntries={['/users/manage/1']} />);
    };

    it.each([
      {},
      { users: [mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' })] },
      { totalPages: 5 },
    ])('passes a11y checks', async ({ users, totalPages }) => {
      const { container } = setUp({ users, totalPages });

      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
      await checkAccessibility({ container });
    });

    it('renders empty users list if no users are returned', async () => {
      setUp();

      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
      expect(screen.getByText('No users found')).toBeInTheDocument();
      expect(screen.queryByTestId('paginator')).not.toBeInTheDocument();
    });

    it('renders list with returned users', async () => {
      setUp({
        users: [mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' })],
        totalPages: 5,
      });

      await waitFor(() => expect(screen.getByRole('table')).toBeInTheDocument());
      expect(screen.queryByText('No users found')).not.toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByTestId('paginator')).toBeInTheDocument();
    });
  });
});
