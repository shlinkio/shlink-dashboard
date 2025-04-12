import { screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { User } from '../../../app/entities/User';
import EditUserServers, { action, loader } from '../../../app/routes/users/edit-user-servers';
import type { ServersService } from '../../../app/servers/ServersService.server';
import type { UsersService } from '../../../app/users/UsersService.server';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('edit-user-servers', () => {
  const getUserServers= vi.fn().mockResolvedValue([]);
  const setServersForUser= vi.fn().mockResolvedValue(undefined);
  const serversService: ServersService = fromPartial({ getUserServers, setServersForUser });

  describe('loader', () => {
    const getUserById = vi.fn();
    const usersService: UsersService = fromPartial({ getUserById });
    const runLoader = () => loader(fromPartial({
      params: { userId: '' },
    }), serversService, usersService);

    it('fetches servers and user', async () => {
      const user = fromPartial<User>({ role: 'managed-user' });
      getUserById.mockResolvedValue(user);

      const result = await runLoader();

      expect(result).toEqual({ servers: [], user });
      expect(getUserServers).toHaveBeenCalledOnce();
      expect(getUserById).toHaveBeenCalledOnce();
    });

    it.each([
      'admin' as const,
      'advanced-user' as const,
    ])('throws when trying to edit servers for a non-managed user', async (role) => {
      const user = fromPartial<User>({ role });
      getUserById.mockResolvedValue(user);

      await expect(runLoader()).rejects.toThrow(expect.objectContaining({
        status: 400,
      }));
      expect(getUserServers).toHaveBeenCalledOnce();
      expect(getUserById).toHaveBeenCalledOnce();
    });
  });

  describe('action', () => {
    const runAction = () => action(fromPartial({
      params: { userId: '123' },
      request: { formData: vi.fn().mockResolvedValue(new FormData()) },
    }), serversService);

    it('sets servers and redirects to servers list', async () => {
      const response = await runAction();

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual('/manage-users/1');
      expect(setServersForUser).toHaveBeenCalledWith('123', new FormData());
    });
  });

  describe('<EditUserServers />', () => {
    const setUp = async () => {
      const prevPath = '/manage-users/1';
      const path = '/manage-users/edit/1/servers';
      const Stub = createRoutesStub([
        {
          path: prevPath,
          Component: () => <>Prev route</>,
        },
        {
          // Search servers endpoint
          path: '/manage-servers/1',
          loader: () => ({
            servers: [{ name: 'bar', publicId: crypto.randomUUID }, { name: 'baz', publicId: crypto.randomUUID }],
          }),
        },
        {
          path,
          Component: EditUserServers,
          HydrateFallback: () => null,
          loader: () => ({ servers: [], user: { username: 'foo' } }),
          action: () => ({}),
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[prevPath, path]} />);
      await screen.findByText('Shlink servers for "foo"');

      return result;
    };

    it('navigates back when clicking Cancel button', async () => {
      const { user } = await setUp();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByText('Prev route')).toBeInTheDocument();
    });

    it('saves servers when clicking Save button', async () => {
      const { user } = await setUp();

      const savePromise = user.click(screen.getByRole('button', { name: 'Save servers' }));
      await waitFor(() => expect(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled());

      await savePromise;
    });

    it('can search servers by typing in combobox', async () => {
      const { user } = await setUp();

      await user.type(screen.getByLabelText('Search servers to add'), 'ba');
      await waitFor(() => expect(screen.getByRole('option', { name: /^baz/ })).toBeInTheDocument());
    });
  });
});
