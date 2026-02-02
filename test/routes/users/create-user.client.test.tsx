import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { action } from '../../../app/routes/users/create-user';
import CreateUser from '../../../app/routes/users/create-user';
import { checkAccessibility } from '../../__helpers__/accessibility';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('create-user', () => {
  describe('<CreateUser />', () => {
    const setUp = async (actionResult?: Awaited<ReturnType<typeof action>>) => {
      const path = '/manage-users/create';
      const Stub = createRoutesStub([
        {
          path,
          Component: CreateUser,
          action: () => actionResult,
        },
        {
          path: '/manage-users/1',
          Component: () => <>Users list</>,
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.findByText('Add new user');

      return result;
    };

    const submitForm = async (user: UserEvent) => {
      await user.type(screen.getByLabelText(/^Username/), 'the_username');
      await user.selectOptions(screen.getByLabelText(/^Role/), 'managed user');
      return user.click(screen.getByRole('button', { name: 'Create user' }));
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form', async () => {
      await setUp();

      expect(screen.getByLabelText(/^Username/)).toBeInTheDocument();
      expect(screen.getByLabelText('Display name')).toBeInTheDocument();
      expect(screen.getByLabelText(/^Role/)).toBeInTheDocument();
    });

    it('renders loading state while saving', async () => {
      const { user } = await setUp();
      const submitPromise = submitForm(user);

      await waitFor(() => expect(screen.getByText('Saving...')).toBeDisabled());
      await submitPromise;
    });

    it('renders error when saving fails', async () => {
      const { user } = await setUp({
        status: 'error',
        messages: { username: 'Error in user field' },
      });
      await submitForm(user);

      await waitFor(() => expect(screen.getByText('Error in user field')).toBeInTheDocument());
    });

    it('renders created user data on success', async () => {
      const { user } = await setUp({
        status: 'success',
        user: fromPartial({ username: 'the_username' }),
        plainTextPassword: 'plain-password',
      });
      await submitForm(user);

      await waitFor(() => expect(screen.getByTestId('success-message')).toBeInTheDocument());

      expect(screen.getByText(/the_username/)).toBeInTheDocument();
      expect(screen.getByText(/plain-password/)).toBeInTheDocument();
    });

    it('navigates back to list when cancel is clicked', async () => {
      const { user } = await setUp();

      await user.click(screen.getByRole('link', { name: 'Cancel' }));
      await waitFor(() => expect(screen.getByText('Users list')).toBeInTheDocument());
    });
  });
});
