import type { LoaderFunctionArgs } from '@remix-run/node';
import { Links, Meta, Outlet, Scripts } from '@remix-run/react';
import { Authenticator } from 'remix-auth';
import { MainHeader } from './common/MainHeader';
import { serverContainer } from './container/container.server';
import { appDataSource } from './db/data-source.server';
import './index.scss';

export async function loader(
  { request }: LoaderFunctionArgs,
  authenticator: Authenticator = serverContainer[Authenticator.name],
) {
  if (!appDataSource.isInitialized) {
    console.log('Initializing database connection...');
    await appDataSource.initialize();
    console.log('Database connection initialized');
  }

  const { pathname } = new URL(request.url);
  const isPublicRoute = ['/login'].includes(pathname);
  if (!isPublicRoute) {
    await authenticator.isAuthenticated(request, {
      failureRedirect: `/login?redirect-to=${encodeURIComponent(pathname)}`,
    });
  }

  return {};
}

/* eslint-disable-next-line no-restricted-exports */
export default function App() {
  return (
    <html lang="en">
      <head>
        <title>Shlink dashboard</title>
        <link rel="icon" href="data:image/x-icon;base64,AA" />
        <Meta />
        <Links />
      </head>
      <body>
        <MainHeader />
        <div className="app">
          <Outlet />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
