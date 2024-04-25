import { Links, Meta, Outlet, Scripts } from '@remix-run/react';
import { MainHeader } from './common/MainHeader';
import './index.scss';

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
