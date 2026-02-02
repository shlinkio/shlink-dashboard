import { screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import Login from '../../app/routes/login';
import { renderWithEvents } from '../__helpers__/set-up-test';

describe('login', () => {
  describe('<Login />', () => {
    const setUp = (error: boolean = false, oidcEnabled: boolean = false, localAuthEnabled: boolean = true) => {
      const Stub = createRoutesStub([
        {
          path: '/',
          Component: Login,
          loader: () => ({ oidcEnabled, localAuthEnabled, oidcProviderName: 'SSO' }),
          action: () => ({ error }),
        },
      ]);
      return renderWithEvents(<Stub />);
    };

    it('renders expected form controls', async () => {
      setUp();

      await waitFor(() => expect(screen.getByLabelText('Username:')).toBeInTheDocument());
      expect(screen.getByLabelText('Password:')).toBeInTheDocument();
      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });

    it('shows loading state while logging in', async () => {
      const { user } = setUp(true);

      await waitFor(() => expect(screen.getByLabelText('Username:')).toBeInTheDocument());

      // Submit form with data
      await user.type(screen.getByLabelText('Username:'), 'incorrect');
      await user.type(screen.getByLabelText('Password:'), 'incorrect');
      // Do not wait for submit to finish, as the loading state will be reset afterward
      const loginPromise = user.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => expect(screen.getByRole('button', { name: 'Logging in...' })).toBeInTheDocument());
      await loginPromise;
    });

    it('renders error when present', async () => {
      const { user } = setUp(true);

      await waitFor(() => expect(screen.getByLabelText('Username:')).toBeInTheDocument());

      // Submit form with data
      await user.type(screen.getByLabelText('Username:'), 'incorrect');
      await user.type(screen.getByLabelText('Password:'), 'incorrect');
      await user.click(screen.getByRole('button', { name: 'Login' }));

      await waitFor(() => expect(screen.getByText('Username or password are incorrect')).toBeInTheDocument());
    });
  });
});
