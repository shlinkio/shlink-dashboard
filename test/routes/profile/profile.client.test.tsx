import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import { SessionProvider } from '../../../app/auth/session-context';
import Profile from '../../../app/routes/profile/profile';
import { render } from '../../__helpers__/set-up-test';

describe('profile', () => {
  describe('<Profile />', () => {
    const setUp = () => {
      const path = '/profile';
      const Stub = createRoutesStub([
        {
          path,
          Component: Profile,
          HydrateFallback: () => null,
        },
      ]);

      return render(
        <SessionProvider value={fromPartial({})}>
          <Stub initialEntries={[path]} />
        </SessionProvider>,
      );
    };

    it('renders both forms', async () => {
      const screen = await setUp();

      await expect.element(screen.getByText('Edit profile')).toBeInTheDocument();
      await expect.element(screen.getByText('Change password')).toBeInTheDocument();
    });
  });
});
