import type { LoaderFunctionArgs } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts, useLoaderData } from '@remix-run/react';
import { Authenticator } from 'remix-auth';
import type { SessionData } from './auth/session-context';
import { SessionProvider } from './auth/session-context';
import { MainHeader } from './common/MainHeader';
import { serverContainer } from './container/container.server';
import { appDataSource } from './db/data-source.server';
import './index.scss';

export async function loader(
  { request }: LoaderFunctionArgs,
  authenticator: Authenticator<SessionData> = serverContainer[Authenticator.name],
) {
  // FIXME This should be done during server start-up, not here
  if (!appDataSource.isInitialized) {
    console.log('Initializing database connection...');
    await appDataSource.initialize();
    console.log('Database connection initialized');
  }

  const { pathname } = new URL(request.url);
  const isPublicRoute = ['/login', '/logout'].includes(pathname);
  const session = await (isPublicRoute
    ? authenticator.isAuthenticated(request) // For public routes, do not redirect
    : authenticator.isAuthenticated(
      request,
      { failureRedirect: `/login?redirect-to=${encodeURIComponent(pathname)}` },
    ));
  return { session };
}

export default function App() {
  const { session } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
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
        <SessionProvider value={session}>
          <MainHeader />
          <div className="app">
            <Outlet />
          </div>
          <Scripts />
        </SessionProvider>
      </body>
    </html>
  );
}
