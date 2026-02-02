import { screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import EditUserServers from '../../../app/routes/users/edit-user-servers';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('edit-user-servers', () => {
  describe('<EditUserServers />', () => {
    const setUp = async () => {
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
