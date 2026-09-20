import { waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import SettingsComp from '../../app/routes/settings';
import { render } from '../__helpers__/set-up-test';

describe('settings', () => {
  describe('<Settings />', () => {
    const setUp = () => {
      const Stub = createRoutesStub([
        {
          path: '/settings/*',
          Component: SettingsComp,
          HydrateFallback: () => null,
          loader: () => ({}),
          action: () => ({}),
        },
      ]);
      return render(<Stub initialEntries={['/settings/general']} />);
    };

    it('renders settings component', async () => {
      const screen = await setUp();

      await waitFor(() => expect.element(screen.getByRole('heading', { name: 'User interface' })).toBeInTheDocument());
      await expect.element(screen.getByRole('heading', { name: 'Real-time updates' })).toBeInTheDocument();
    });
  });
});
