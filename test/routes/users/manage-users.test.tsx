import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { LoaderFunctionArgs } from 'react-router';
import { createRoutesStub } from 'react-router';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import type { User } from '../../../app/entities/User';
import ManageUsers, { loader } from '../../../app/routes/users/manage-users';
import type { UsersService } from '../../../app/users/UsersService.server';
import { checkAccessibility } from '../../__helpers__/accessibility';

describe('manage-users', () => {
  const getSession = vi.fn();
  const authHelper: AuthHelper = fromPartial({ getSession });
  const listUsers = vi.fn();
  const usersService: UsersService = fromPartial({ listUsers });
  const mockUser = (userData: Partial<User>): User => fromPartial({ ...userData, createdAt: new Date() });

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
    const setUp = ({ users = [], totalPages = 1 }: { users?: User[]; totalPages?: number; } = {}) => {
      const Stub = createRoutesStub([
        {
          path: '/users/manage/1',
          Component: ManageUsers,
          loader: () => ({ users, totalPages }),
        },
      ]);
      return render(<Stub initialEntries={['/users/manage/1']} />);
    };

    it.each([
      {},
      { users: [mockUser({ username: 'foo', displayName: 'John Doe', role: 'admin' })] },
      { totalPages: 5 },
    ])('passes a11y checks', ({ users, totalPages }) => checkAccessibility(setUp({ users, totalPages })));

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
