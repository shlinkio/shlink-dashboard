import { render, screen, waitFor } from '@testing-library/react';
import { createRoutesStub } from 'react-router';
import SettingsComp from '../../app/routes/settings';

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
      setUp();

      await waitFor(() => expect(screen.getByRole('heading', { name: 'User interface' })).toBeInTheDocument());
      expect(screen.getByRole('heading', { name: 'Real-time updates' })).toBeInTheDocument();
    });
  });
});
