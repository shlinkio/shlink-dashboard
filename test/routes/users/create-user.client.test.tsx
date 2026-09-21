import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { action } from '../../../app/routes/users/create-user';
import CreateUser from '../../../app/routes/users/create-user';
import { checkAccessibility } from '../../__helpers__/accessibility';
import type { RenderWithEventsResult } from '../../__helpers__/set-up-test';
import { renderWithEvents } from '../../__helpers__/set-up-test';

describe('create-user', () => {
  describe('<CreateUser />', () => {
    const { promise, resolve: resolveActionPromise } = Promise.withResolvers<Awaited<ReturnType<typeof action>>>();
    const actionMock = vi.fn(async () => {
      // Make the action wait until we resolve it, so that we can test intermediary fetcher state transitions
      return await promise;
    });
    const setUp = () => {
      const path = '/manage-users/create';
      const Stub = createRoutesStub([
        {
          path,
          Component: CreateUser,
          action: actionMock,
        },
        {
          path: '/manage-users/1',
          Component: () => <>Users list</>,
        },
      ]);

      return renderWithEvents(<Stub initialEntries={[path]} />);
    };

    const submitForm = async ({ user, ...screen }: RenderWithEventsResult) => {
      await user.type(screen.getByLabelText(/^Username/), 'the_username');
      await user.selectOptions(screen.getByLabelText(/^Role/), 'managed user');
      await user.click(screen.getByRole('button', { name: 'Create user' }));
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form', async () => {
      const screen = await setUp();

      await expect.element(screen.getByLabelText(/^Username/)).toBeInTheDocument();
      await expect.element(screen.getByLabelText('Display name')).toBeInTheDocument();
      await expect.element(screen.getByLabelText(/^Role/)).toBeInTheDocument();
    });

    it('renders loading state while saving', async () => {
      const screen = await setUp();

      expect(actionMock).not.toHaveBeenCalled();
      await submitForm(screen);

      expect(actionMock).toHaveBeenCalled();
      await expect.element(screen.getByText('Saving...')).toBeDisabled();

      resolveActionPromise(fromPartial({}));
    });

    it.skip('renders error when saving fails', async () => {
      const screen = await setUp();

      resolveActionPromise({
        status: 'error',
        messages: { username: 'Error in user field' },
      });
      await submitForm(screen);

      await expect.element(screen.getByText('Error in user field')).toBeInTheDocument();
    });

    it.skip('renders created user data on success', async () => {
      const screen = await setUp();

      await submitForm(screen);

      resolveActionPromise({
        status: 'success',
        user: fromPartial({ username: 'the_username' }),
        plainTextPassword: 'plain-password',
      });

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
