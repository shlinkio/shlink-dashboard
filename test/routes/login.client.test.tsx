import { createRoutesStub } from 'react-router';
import { page as screen } from 'vitest/browser';
import Login from '../../app/routes/login';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('login', () => {
  describe('<Login />', () => {
    const setUp = (error: boolean = false) => {
      const Stub = createRoutesStub([
        {
          path: '/',
          Component: Login,
          action: () => ({ error }),
        },
      ]);
      return renderWithEvents(<Stub />);
    };

    it('renders expected form controls', async () => {
      setUp();

      await expect.element(screen.getByLabelText('Username:')).toBeInTheDocument();
      await expect.element(screen.getByLabelText('Password:')).toBeInTheDocument();
      await expect.element(screen.getByTestId('error-message')).not.toBeInTheDocument();
    });

    // FIXME Skipping, as vitest/browser requires user events to be awaited, so intermediary loading states cannot be
    //       tested
    it.skip('shows loading state while logging in', async () => {
      const { user } = setUp(true);

      await expect.element(screen.getByLabelText('Username:')).toBeInTheDocument();

      // Submit form with data
      await user.type(screen.getByLabelText('Username:'), 'incorrect');
      await user.type(screen.getByLabelText('Password:'), 'incorrect');
      // Do not wait for submit to finish, as the loading state will be reset afterward
      const loginPromise = user.click(screen.getByRole('button', { name: 'Login' }));

      await expect.element(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument();
      await loginPromise;
    });

    it('renders error when present', async () => {
      const { user } = setUp(true);

      await expect.element(screen.getByLabelText('Username:')).toBeInTheDocument();

      // Submit form with data
      await user.type(screen.getByLabelText('Username:'), 'incorrect');
      await user.type(screen.getByLabelText('Password:'), 'incorrect');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      await expect.element(screen.getByText('Username or password are incorrect')).toBeInTheDocument();
    });
  });
});
