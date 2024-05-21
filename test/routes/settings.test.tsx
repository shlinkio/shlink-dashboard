import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { createRemixStub } from '@remix-run/testing';
import type { Settings } from '@shlinkio/shlink-web-component/settings';
import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Authenticator } from 'remix-auth';
import type { SessionData } from '../../app/auth/session-context';
import SettingsComp, { action as settingsAction, loader } from '../../app/routes/settings.$';
import type { SettingsService } from '../../app/settings/SettingsService.server';

describe('settings', () => {
  const isAuthenticated = vi.fn();
  const authenticator = fromPartial<Authenticator<SessionData>>({ isAuthenticated });
  const userSettings = vi.fn();
  const saveUserSettings = vi.fn();
  const settingsService = fromPartial<SettingsService>({ userSettings, saveUserSettings });

  describe('loader', () => {
    it('checks if user is authenticated and returns their settings', async () => {
      const settings = fromPartial<Settings>({
        ui: { theme: 'dark' },
      });
      userSettings.mockResolvedValue(settings);
      isAuthenticated.mockResolvedValue({ userId: 1 });

      const result = await loader(fromPartial({ request: {} }), authenticator, settingsService);

      expect(result).toEqual(settings);
      expect(userSettings).toHaveBeenCalled();
      expect(isAuthenticated).toHaveBeenCalled();
    });
  });

  describe('action', () => {
    const setUp = () => (args: ActionFunctionArgs) => settingsAction(args, authenticator, settingsService);
    const request = fromPartial<Request>({ json: vi.fn().mockResolvedValue({}) });

    it('does not save settings when user is not logged in', async () => {
      const action = setUp();

      isAuthenticated.mockResolvedValue(null);

      await action(fromPartial({ request }));

      expect(isAuthenticated).toHaveBeenCalledWith(request);
      expect(saveUserSettings).not.toHaveBeenCalled();
    });

    it('saves settings when user is logged in', async () => {
      const action = setUp();

      isAuthenticated.mockResolvedValue({ userId: 1 });

      await action(fromPartial({ request }));

      expect(isAuthenticated).toHaveBeenCalledWith(request);
      expect(saveUserSettings).toHaveBeenCalledWith(1, {});
    });
  });

  // Skipping for now, as createRemixStub always results in a 404 page
  describe.skip('<Settings />', () => {
    const setUp = () => {
      const RemixStub = createRemixStub([
        {
          path: '/settings',
          Component: SettingsComp,
          loader: () => json({}),
          action: () => json({}),
        },
      ]);
      return render(<RemixStub />);
    };

    it('renders settings component', async () => {
      setUp();

      await waitFor(() => expect(screen.getByRole('heading', { name: 'User interface' })).toBeInTheDocument());
      expect(screen.getByRole('heading', { name: 'Real-time updates' })).toBeInTheDocument();
    });
  });
});
