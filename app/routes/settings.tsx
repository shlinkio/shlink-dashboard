import type { Settings as AppSettings } from '@shlinkio/shlink-web-component/settings';
import { ShlinkWebSettings } from '@shlinkio/shlink-web-component/settings';
import { useCallback } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import { Route, Routes , useFetcher, useLoaderData } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import { ClientOnly } from '../common/ClientOnly';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { SettingsService } from '../settings/SettingsService.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
) {
  const { publicId } = await authHelper.getSession(request, '/login');
  return settingsService.userSettings(publicId);
}

export async function action(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
) {
  const [sessionData, newSettings] = await Promise.all([authHelper.getSession(request), request.json()]);
  if (sessionData) {
    await settingsService.saveUserSettings(sessionData.publicId, newSettings);
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

  return (
    <Layout>
      <ClientOnly>
        <Routes>
          <Route
            path="*"
            element={(
              <ShlinkWebSettings
                settings={settings}
                onUpdateSettings={submitSettings}
                defaultShortUrlsListOrdering={{}}
              />
            )}
          />
        </Routes>
      </ClientOnly>
    </Layout>
  );
}
