import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import type { Settings as AppSettings } from '@shlinkio/shlink-web-component/settings';
import { ShlinkWebSettings } from '@shlinkio/shlink-web-component/settings';
import { useCallback } from 'react';
import { Authenticator } from 'remix-auth';
import type { SessionData } from '../auth/session-context';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { SettingsService } from '../settings/SettingsService.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  authenticator: Authenticator<SessionData> = serverContainer[Authenticator.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
) {
  const { userId } = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  return settingsService.userSettings(userId);
}

export async function action(
  { request }: ActionFunctionArgs,
  authenticator: Authenticator<SessionData> = serverContainer[Authenticator.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
) {
  const [sessionData, newSettings] = await Promise.all([
    authenticator.isAuthenticated(request),
    request.json(),
  ]);
  if (!sessionData) {
    return {};
  }

  await settingsService.saveUserSettings(sessionData.userId, newSettings);
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
