import type { LoaderFunctionArgs } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, useLoaderData } from '@remix-run/react';
import type { Theme } from '@shlinkio/shlink-frontend-kit';
import { getSystemPreferredTheme } from '@shlinkio/shlink-frontend-kit';
import { useEffect, useState } from 'react';
import { AuthHelper } from './auth/auth-helper.server';
import { SessionProvider } from './auth/session-context';
import { MainHeader } from './common/MainHeader';
import { serverContainer } from './container/container.server';
import { SettingsService } from './settings/SettingsService.server';
import './index.scss';

export async function loader(
  { request }: LoaderFunctionArgs,
  settingsService: SettingsService = serverContainer[SettingsService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const { pathname } = new URL(request.url);
  const isPublicRoute = ['/login', '/logout'].includes(pathname);
  const sessionData = await (isPublicRoute
    ? authHelper.getSession(request)
    // For non-public routes, redirect to login route
    : authHelper.getSession(request, `/login?redirect-to=${encodeURIComponent(pathname)}`)
  );

  const settings = sessionData && await settingsService.userSettings(sessionData.userId);

  return { sessionData, settings };
}

export default function App() {
  const { sessionData, settings } = useLoaderData<typeof loader>();
  const [systemPreferredTheme, setSystemPreferredTheme] = useState<Theme>('light');

  useEffect(() => {
    // This check does not make sense in the server, so doing in useEffect to make sure it is run in the browser
    setSystemPreferredTheme(getSystemPreferredTheme());
  }, []);

  return (
    <html lang="en" data-theme={settings?.ui?.theme ?? systemPreferredTheme}>
      <head>
        <title>Shlink dashboard</title>

        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#4696e5" />
        <Meta />

        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Links />
      </head>
      <body>
        <SessionProvider value={sessionData ?? null}>
          <MainHeader />
          <div className="app tw-h-full">
            <Outlet />
          </div>
          <Scripts />
        </SessionProvider>
      </body>
    </html>
  );
}
