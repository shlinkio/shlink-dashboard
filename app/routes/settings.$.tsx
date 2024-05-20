import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import type { Settings as AppSettings } from '@shlinkio/shlink-web-component/settings';
import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { Authenticator } from 'remix-auth';
import type { SessionData } from '../auth/session-context';
import { serverContainer } from '../container/container.server';
import { SettingsService } from '../settings/SettingsService.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  settingsService: SettingsService = serverContainer[SettingsService.name],
  authenticator: Authenticator<SessionData> = serverContainer[Authenticator.name],
) {
  const { userId } = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  return settingsService.userSettings(userId);
}

export async function action(
  { request }: ActionFunctionArgs,
  settingsService: SettingsService = serverContainer[SettingsService.name],
  authenticator: Authenticator<SessionData> = serverContainer[Authenticator.name],
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
  const [component, setComponent] = useState<ReactNode>(null);
  const settings = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  // TODO Add some deferring
  const submitSettings = useCallback((newSettings: AppSettings) => fetcher.submit(newSettings, {
    method: 'POST',
    encType: 'application/json',
  }), [fetcher]);

  useEffect(() => {
    import('@shlinkio/shlink-web-component/settings').then(({ ShlinkWebSettings }) => setComponent(
      <ShlinkWebSettings
        settings={settings}
        defaultShortUrlsListOrdering={{}}
        updateSettings={submitSettings}
      />,
    ));
  }, [submitSettings, settings]);

  return (
    <div className="tw-container lg:tw-p-5 tw-p-3 mx-auto">
      {component}
    </div>
  );
}
