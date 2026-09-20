import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { action } from '../../../app/routes/users/create-user';
import CreateUser from '../../../app/routes/users/create-user';
import { checkAccessibility } from '../../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../../__helpers__/set-up-test';
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

      const screen = await renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.getByText('Add new user').findElement();

      return screen;
    };

    const submitForm = async ({ user, ...screen }: RenderWithEventsResult) => {
      await user.type(screen.getByLabelText(/^Username/), 'the_username');
      await user.selectOptions(screen.getByLabelText(/^Role/), 'managed user');
      return user.click(screen.getByRole('button', { name: 'Create user' }));
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form', async () => {
      const screen = await setUp();

      await expect.element(screen.getByLabelText(/^Username/)).toBeInTheDocument();
      await expect.element(screen.getByLabelText('Display name')).toBeInTheDocument();
      await expect.element(screen.getByLabelText(/^Role/)).toBeInTheDocument();
    });

    // FIXME Skipping, as vitest/browser requires user events to be awaited, so intermediary loading states cannot be
    //       tested
    it.skip('renders loading state while saving', async () => {
      const screen = await setUp();
      const submitPromise = submitForm(screen);

      await expect.element(screen.getByText('Saving...')).toBeDisabled();
      await submitPromise;
    });

    it('renders error when saving fails', async () => {
      const screen = await setUp({
        status: 'error',
        messages: { username: 'Error in user field' },
      });
      await submitForm(screen);

      await expect.element(screen.getByText('Error in user field')).toBeInTheDocument();
    });

    it('renders created user data on success', async () => {
      const screen = await setUp({
        status: 'success',
        user: fromPartial({ username: 'the_username' }),
        plainTextPassword: 'plain-password',
      });
      await submitForm(screen);

      await expect.element(screen.getByTestId('success-message')).toBeInTheDocument();
      await expect.element(screen.getByText(/the_username/)).toBeInTheDocument();
      await expect.element(screen.getByText(/plain-password/)).toBeInTheDocument();
    });

    it('navigates back to list when cancel is clicked', async () => {
      const { user, ...screen } = await setUp();

      await user.click(screen.getByRole('link', { name: 'Cancel' }));
      await expect.element(screen.getByText('Users list')).toBeInTheDocument();
    });
  });
});
