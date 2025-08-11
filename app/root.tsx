import type { Theme } from '@shlinkio/shlink-frontend-kit';
import { BRAND_COLOR_LM, getSystemPreferredTheme } from '@shlinkio/shlink-frontend-kit';
import { useEffect, useState } from 'react';
import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { data, Links, Meta, Outlet, Scripts } from 'react-router';
import type { Route } from './+types/root';
import { AuthHelper } from './auth/auth-helper.server';
import { SessionProvider } from './auth/session-context';
import { MainHeader } from './common/MainHeader';
import { serverContainer } from './container/container.server';
import { forkEmMiddleware } from './middleware/fork-em-middleware.server';
import type { RouteComponentProps } from './routes/types';
import { SettingsService } from './settings/SettingsService.server';
import './tailwind.css';

export const unstable_middleware = [forkEmMiddleware];

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
    : authHelper.getSession(request, `/login?${new URLSearchParams({ 'redirect-to': pathname })}`)
  );

  const settings = sessionData && (await settingsService.userSettings(sessionData.publicId));
  const sessionCookie = await authHelper.refreshSessionExpiration(request);

  return data(
    { sessionData, settings },
    sessionCookie ? {
      headers: { 'Set-Cookie': sessionCookie },
    } : undefined,
  );
}

export default function App({ loaderData }: RouteComponentProps<Route.ComponentProps>) {
  const { sessionData, settings } = loaderData;
  const [systemPreferredTheme, setSystemPreferredTheme] = useState<Theme>('light');

  useEffect(() => {
    // This check does not make sense in the server, so doing in useEffect to make sure it is run in the browser
    setSystemPreferredTheme(getSystemPreferredTheme());
  }, []);

  return (
    <html lang="en" data-theme={settings?.ui?.theme ?? systemPreferredTheme}>
      <head>
        <title>Shlink dashboard</title>
        <Meta />
        <Links />
      </head>
      <body>
        <SessionProvider value={sessionData ?? null}>
          <MainHeader />
          <div className="pt-(--header-height)">
            <Outlet />
          </div>
          <Scripts />
        </SessionProvider>
      </body>
    </html>
  );
}

export const links: LinksFunction = () => [
  // Standard favicons
  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
  { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg', sizes: 'any' },
  { rel: 'icon', type: 'image/png', href: '/favicon.png' },
  { rel: 'icon', type: 'image/gif', href: '/favicon.gif' },
  // Apple Touch Icons
  { rel: 'apple-touch-icon', sizes: '16x16', href: '/icons/icon-16x16.png' },
  { rel: 'apple-touch-icon', sizes: '24x24', href: '/icons/icon-24x24.png' },
  { rel: 'apple-touch-icon', sizes: '32x32', href: '/icons/icon-32x32.png' },
  { rel: 'apple-touch-icon', sizes: '40x40', href: '/icons/icon-40x40.png' },
  { rel: 'apple-touch-icon', sizes: '48x48', href: '/icons/icon-48x48.png' },
  { rel: 'apple-touch-icon', sizes: '60x60', href: '/icons/icon-60x60.png' },
  { rel: 'apple-touch-icon', sizes: '64x64', href: '/icons/icon-64x64.png' },
  { rel: 'apple-touch-icon', sizes: '72x72', href: '/icons/icon-72x72.png' },
  { rel: 'apple-touch-icon', sizes: '76x76', href: '/icons/icon-76x76.png' },
  { rel: 'apple-touch-icon', sizes: '96x96', href: '/icons/icon-96x96.png' },
  { rel: 'apple-touch-icon', sizes: '114x114', href: '/icons/icon-114x114.png' },
  { rel: 'apple-touch-icon', sizes: '120x120', href: '/icons/icon-120x120.png' },
  { rel: 'apple-touch-icon', sizes: '128x128', href: '/icons/icon-128x128.png' },
  { rel: 'apple-touch-icon', sizes: '144x144', href: '/icons/icon-144x144.png' },
  { rel: 'apple-touch-icon', sizes: '150x150', href: '/icons/icon-150x150.png' },
  { rel: 'apple-touch-icon', sizes: '152x152', href: '/icons/icon-152x152.png' },
  { rel: 'apple-touch-icon', sizes: '160x160', href: '/icons/icon-160x160.png' },
  { rel: 'apple-touch-icon', sizes: '167x167', href: '/icons/icon-167x167.png' },
  { rel: 'apple-touch-icon', sizes: '180x180', href: '/icons/icon-180x180.png' },
  { rel: 'apple-touch-icon', sizes: '192x192', href: '/icons/icon-192x192.png' },
  { rel: 'apple-touch-icon', sizes: '196x196', href: '/icons/icon-196x196.png' },
  { rel: 'apple-touch-icon', sizes: '228x228', href: '/icons/icon-228x228.png' },
  { rel: 'apple-touch-icon', sizes: '256x256', href: '/icons/icon-256x256.png' },
  { rel: 'apple-touch-icon', sizes: '310x310', href: '/icons/icon-310x310.png' },
  { rel: 'apple-touch-icon', sizes: '384x384', href: '/icons/icon-384x384.png' },
  { rel: 'apple-touch-icon', sizes: '512x512', href: '/icons/icon-512x512.png' },
  { rel: 'apple-touch-icon', sizes: '1024x1024', href: '/icons/icon-1024x1024.png' },
  // Normal icons
  { rel: 'icon', type: 'image/png', sizes: '1024x1024', href: '/icons/icon-1024x1024.png' },
  { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/icons/icon-512x512.png' },
  { rel: 'icon', type: 'image/png', sizes: '384x384', href: '/icons/icon-384x384.png' },
  { rel: 'icon', type: 'image/png', sizes: '310x310', href: '/icons/icon-310x310.png' },
  { rel: 'icon', type: 'image/png', sizes: '256x256', href: '/icons/icon-256x256.png' },
  { rel: 'icon', type: 'image/png', sizes: '228x228', href: '/icons/icon-228x228.png' },
  { rel: 'icon', type: 'image/png', sizes: '196x196', href: '/icons/icon-196x196.png' },
  { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/icons/icon-192x192.png' },
  { rel: 'icon', type: 'image/png', sizes: '180x180', href: '/icons/icon-180x180.png' },
  { rel: 'icon', type: 'image/png', sizes: '167x167', href: '/icons/icon-167x167.png' },
  { rel: 'icon', type: 'image/png', sizes: '160x160', href: '/icons/icon-160x160.png' },
  { rel: 'icon', type: 'image/png', sizes: '152x152', href: '/icons/icon-152x152.png' },
  { rel: 'icon', type: 'image/png', sizes: '150x150', href: '/icons/icon-150x150.png' },
  { rel: 'icon', type: 'image/png', sizes: '144x144', href: '/icons/icon-144x144.png' },
  { rel: 'icon', type: 'image/png', sizes: '128x128', href: '/icons/icon-128x128.png' },
  { rel: 'icon', type: 'image/png', sizes: '120x120', href: '/icons/icon-120x120.png' },
  { rel: 'icon', type: 'image/png', sizes: '114x114', href: '/icons/icon-114x114.png' },
  { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/icons/icon-96x96.png' },
  { rel: 'icon', type: 'image/png', sizes: '76x76', href: '/icons/icon-76x76.png' },
  { rel: 'icon', type: 'image/png', sizes: '72x72', href: '/icons/icon-72x72.png' },
  { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/icons/icon-64x64.png' },
  { rel: 'icon', type: 'image/png', sizes: '60x60', href: '/icons/icon-60x60.png' },
  { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/icons/icon-48x48.png' },
  { rel: 'icon', type: 'image/png', sizes: '40x40', href: '/icons/icon-40x40.png' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/icons/icon-32x32.png' },
  { rel: 'icon', type: 'image/png', sizes: '24x24', href: '/icons/icon-24x24.png' },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/icons/icon-16x16.png' },
];

export const meta: MetaFunction = () => [
  { charSet: 'utf-8' },
  { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no' },
  { name: 'theme-color', content: BRAND_COLOR_LM },

  // MS icons
  { name: 'msapplication-TileImage', content: '/icons/icon-144x144.png' },
  { name: 'msapplication-square70x70logo', content: '/icons/icon-70x70.png' },
  { name: 'msapplication-square144x144logo', content: '/icons/icon-144x144.png' },
  { name: 'msapplication-square150x150logo', content: '/icons/icon-150x150.png' },
  { name: 'msapplication-square310x310logo', content: '/icons/icon-310x310.png' },
];
