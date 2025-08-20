import type { Settings } from '@shlinkio/shlink-web-component/settings';
import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ActionFunctionArgs } from 'react-router';
import { createRoutesStub } from 'react-router';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import SettingsComp, { action as settingsAction, loader } from '../../../app/routes/settings';
import type { SettingsService } from '../../../app/settings/SettingsService.server';

describe('settings', () => {
  const getSession = vi.fn();
  const authHelper = fromPartial<AuthHelper>({ getSession });
  const userSettings = vi.fn();
  const saveUserSettings = vi.fn();
  const settingsService = fromPartial<SettingsService>({ userSettings, saveUserSettings });

  describe('loader', () => {
    it('checks if user is authenticated and returns their settings', async () => {
      const settings = fromPartial<Settings>({
        ui: { theme: 'dark' },
      });
      userSettings.mockResolvedValue(settings);
      getSession.mockResolvedValue({ publicId: '1' });

      const result = await loader(fromPartial({ request: {} }), authHelper, settingsService);

      expect(result).toEqual(settings);
      expect(userSettings).toHaveBeenCalled();
      expect(getSession).toHaveBeenCalled();
    });
  });

  describe('action', () => {
    const setUp = () => (args: ActionFunctionArgs) => settingsAction(args, authHelper, settingsService);
    const request = fromPartial<Request>({ json: vi.fn().mockResolvedValue({}) });

    it('does not save settings when user is not logged in', async () => {
      const action = setUp();

      getSession.mockResolvedValue(undefined);

      await action(fromPartial({ request }));

      expect(getSession).toHaveBeenCalledWith(request);
      expect(saveUserSettings).not.toHaveBeenCalled();
    });

    it('saves settings when user is logged in', async () => {
      const action = setUp();

      getSession.mockResolvedValue({ publicId: '1' });

      await action(fromPartial({ request }));

      expect(getSession).toHaveBeenCalledWith(request);
      expect(saveUserSettings).toHaveBeenCalledWith('1', {});
    });
  });

  // FIXME Skipping for now, as the test always resolves a 404
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
