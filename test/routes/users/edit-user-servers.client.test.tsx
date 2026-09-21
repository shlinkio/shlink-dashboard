import { createRoutesStub } from 'react-router';
import EditUserServers from '../../../app/routes/users/edit-user-servers';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('edit-user-servers', () => {
  describe('<EditUserServers />', () => {
    const { promise, resolve: resolveActionPromise } = Promise.withResolvers<void>();
    const action = vi.fn(async () => {
      // Make the action wait until we resolve it, so that we can test intermediary fetcher state transitions
      await promise;
      return {};
    });
    const setUp = () => {
      const prevPath = '/manage-users/1';
      const path = '/manage-users/1/edit-servers';
      const Stub = createRoutesStub([
        {
          path: prevPath,
          Component: () => <>Prev route</>,
        },
        {
          // Search servers endpoint
          path: '/manage-servers/1',
          loader: () => ({
            servers: [
              { name: 'bar', publicId: crypto.randomUUID() },
              { name: 'baz', publicId: crypto.randomUUID() },
            ],
          }),
        },
        {
          path,
          Component: EditUserServers,
          HydrateFallback: () => null,
          loader: () => ({ servers: [], user: { username: 'foo' } }),
          action,
        },
      ]);

      return renderWithEvents(<Stub initialEntries={[prevPath, path]} />);
    };

    it('navigates back when clicking Cancel button', async () => {
      const { user, ...screen } = await setUp();

      await user.click(screen.getByRole('button', { name: 'Cancel' }));
      await expect.element(screen.getByText('Prev route')).toBeInTheDocument();
    });

    it('invokes route action whn servers are saved', async () => {
      const { user, ...screen } = await setUp();

      expect(action).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Save servers' }));

      expect(action).toHaveBeenCalled();
      await expect.element(screen.getByRole('button', { name: 'Saving...' })).toBeDisabled();

      resolveActionPromise();
    });

    it('can search servers by typing in combobox', async () => {
      const { user, ...screen } = await setUp();

      await user.type(screen.getByLabelText('Search servers to add'), 'ba');
      await expect.element(screen.getByRole('option', { name: /^baz/ })).toBeInTheDocument();
    });
  });
});
