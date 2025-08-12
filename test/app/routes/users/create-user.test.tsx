import { screen, waitFor } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import CreateUser, { action } from '../../../../app/routes/users/create-user';
import type { UsersService } from '../../../../app/users/UsersService.server';
import { DuplicatedEntryError } from '../../../../app/validation/DuplicatedEntryError.server';
import { ValidationError } from '../../../../app/validation/ValidationError.server';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/set-up-test';

describe('create-user', () => {
  describe('action', () => {
    const createUser = vi.fn();
    const usersService: UsersService = fromPartial({ createUser });
    const runAction = () => {
      const request = fromPartial<Request>({ formData: vi.fn().mockResolvedValue(new FormData()) });
      return action(fromPartial({ request }), usersService);
    };

    it('returns success when creating user works', async () => {
      const expectedUser = fromPartial({});
      const expectedPassword = 'the_password';
      createUser.mockResolvedValue([expectedUser, expectedPassword]);

      const result = await runAction();

      expect(result).toEqual({
        status: 'success',
        user: expectedUser,
        plainTextPassword: expectedPassword,
      });
    });

    it.each([
      {
        error: new DuplicatedEntryError('username'),
        expectedMessages: {
          username: 'Username is already in use.',
        },
      },
      {
        error: new ValidationError({ username: 'an error' }),
        expectedMessages: {
          username: 'Username can only contain letters and numbers. Underscore (_) and dot (.) can also be used anywhere except at the beginning or end.',
        },
      },
      {
        error: new ValidationError({}),
        expectedMessages: {},
      },
      {
        error: new Error(''),
        expectedMessages: {},
      },
    ])('returns expected messages on error', async ({ error, expectedMessages }) => {
      createUser.mockRejectedValue(error);
      const result = await runAction();

      expect(result).toEqual({
        status: 'error',
        messages: expectedMessages,
      });
    });
  });

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
