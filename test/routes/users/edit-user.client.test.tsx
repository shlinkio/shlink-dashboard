import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { User } from '../../../app/entities/User';
import EditUser from '../../../app/routes/users/edit-user';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('edit-user', () => {
  describe('<EditUser />', () => {
    const setUp = async (user: User) => {
      const path = '';
      const Stub = createRoutesStub([
        {
          path,
          Component: EditUser,
          HydrateFallback: () => null,
          loader: () => ({ user }),
          action: () => ({}),
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.findByText('Edit user');

      return result;
    };

    it('passes a11y checks', () =>
      checkAccessibility(
        setUp(fromPartial<User>({ id: 'def', username: 'bar', displayName: 'Jane Doe', role: 'admin' })),
      ));

    it.each([
      [fromPartial<User>({ id: 'abc', username: 'foo', displayName: 'Foo Bar', role: 'advanced-user' })],
      [fromPartial<User>({ id: 'def', username: 'bar', displayName: 'Jane Doe', role: 'admin' })],
    ])('loads the form with the user data set on it', async (user) => {
      await setUp(user);

      const usernameInput = screen.getByLabelText(/^Username/);
      await expect.element(usernameInput).toHaveValue(user.username);
      await expect.element(usernameInput).toHaveAttribute('readonly');

      await expect.element(screen.getByLabelText('Display name')).toHaveValue(user.displayName);
      await expect.element(screen.getByLabelText(/^Role/)).toHaveValue(user.role);
    });
  });
});
