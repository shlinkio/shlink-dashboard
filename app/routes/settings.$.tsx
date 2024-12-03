import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import type { Settings as AppSettings } from '@shlinkio/shlink-web-component/settings';
import { ShlinkWebSettings } from '@shlinkio/shlink-web-component/settings';
import { useCallback } from 'react';
import { AuthHelper } from '../auth/auth-helper.server';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { SettingsService } from '../settings/SettingsService.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  settingsService: SettingsService = serverContainer[SettingsService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const { userId } = await authHelper.getSession(request, '/login');
  return settingsService.userSettings(userId);
}

export async function action(
  { request }: ActionFunctionArgs,
  settingsService: SettingsService = serverContainer[SettingsService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
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

  return (
    <Layout>
      <ShlinkWebSettings
        settings={settings}
        updateSettings={submitSettings}
        defaultShortUrlsListOrdering={{}}
      />
    </Layout>
  );
}
