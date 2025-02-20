import type { Settings as AppSettings } from '@shlinkio/shlink-web-component/settings';
import { ShlinkWebSettings } from '@shlinkio/shlink-web-component/settings';
import { useCallback } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Route, Routes } from 'react-router';
import { useFetcher, useLoaderData } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { SettingsService } from '../settings/SettingsService.server';
import { useIsClient } from '../utils/hooks';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
) {
  const { userId } = await authHelper.getSession(request, '/login');
  return settingsService.userSettings(userId);
}

export async function action(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
) {
  const [sessionData, newSettings] = await Promise.all([authHelper.getSession(request), request.json()]);
  if (sessionData) {
    await settingsService.saveUserSettings(sessionData.userId, newSettings);
  }

  return {};
}

export default function Settings() {
  const settings = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  // TODO Add some deferring
  const submitSettings = useCallback((newSettings: AppSettings) => fetcher.submit(newSettings, {
    method: 'POST',
    encType: 'application/json',
  }), [fetcher]);
  const isClient = useIsClient();

  return (
    <Layout>
      {isClient && (
        <Routes>
          <Route
            path="*"
            element={(
              <ShlinkWebSettings
                settings={settings}
                updateSettings={submitSettings}
                defaultShortUrlsListOrdering={{}}
              />
            )}
          />
        </Routes>
      )}
    </Layout>
  );
}
