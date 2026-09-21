import { createRoutesStub } from 'react-router';
import Login from '../../app/routes/login';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('login', () => {
  describe('<Login />', () => {
    const setUp = async () => {
      const { promise, resolve: resolveActionPromise } = Promise.withResolvers<boolean>();
      const action = vi.fn(async () => {
        // Make the action wait until we resolve it, so that we can test intermediary fetcher state transitions
        const error = await promise;
        return { error };
      });

      const Stub = createRoutesStub([
        {
          path: '/',
          Component: Login,
          action,
        },
      ]);

      const renderResult = await renderWithEvents(<Stub />);
      return { ...renderResult, action, resolveActionPromise };
    };

    it('renders expected form controls', async () => {
      const screen = await setUp();

      await expect.element(screen.getByLabelText('Username:')).toBeInTheDocument();
      await expect.element(screen.getByLabelText('Password:')).toBeInTheDocument();
      await expect.element(screen.getByTestId('error-message')).not.toBeInTheDocument();
    });

    it('shows loading state while logging in', async () => {
      const { user, action, resolveActionPromise, ...screen } = await setUp();

      await expect.element(screen.getByLabelText('Username:')).toBeInTheDocument();

      // Submit form with data
      await user.type(screen.getByLabelText('Username:'), 'incorrect');
      await user.type(screen.getByLabelText('Password:'), 'incorrect');

      expect(action).not.toHaveBeenCalled();
      await user.click(screen.getByRole('button', { name: 'Login' }));

      expect(action).toHaveBeenCalled();
      await expect.element(screen.getByRole('button', { name: 'Logging in...' })).toBeDisabled();

      resolveActionPromise(true);
    });

    it('renders error when present', async () => {
      const { user, resolveActionPromise, ...screen } = await setUp();

      await expect.element(screen.getByLabelText('Username:')).toBeInTheDocument();

      // Submit form with data
      await user.type(screen.getByLabelText('Username:'), 'incorrect');
      await user.type(screen.getByLabelText('Password:'), 'incorrect');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      resolveActionPromise(true);

      await expect.element(screen.getByText('Username or password are incorrect')).toBeInTheDocument();
    });
  });
});
