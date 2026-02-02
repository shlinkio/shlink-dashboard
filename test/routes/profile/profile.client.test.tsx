import { render, screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { SessionProvider } from '../../../app/auth/session-context';
import Profile from '../../../app/routes/profile/profile';

describe('profile', () => {
  describe('<Profile />', () => {
    const setUp = () => {
      const path = '/profile';
      const Stub = createRoutesStub([{
        path,
        Component: Profile,
        HydrateFallback: () => null,
      }]);

      return render(
        <SessionProvider value={fromPartial({})}>
          <Stub initialEntries={[path]} />
        </SessionProvider>,
      );
    };

    it('renders both forms', async () => {
      setUp();

      expect(screen.getByText('Edit profile')).toBeInTheDocument();
      expect(screen.getByText('Change password')).toBeInTheDocument();
    });
  });
});
