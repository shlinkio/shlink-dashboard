import { createRequestHandler } from '@remix-run/express';
import express from 'express';
import { serverContainer } from './app/container/container.server';
import { isProd } from './app/utils/env.server';

const viteDevServer = isProd()
  ? null
  : await import('vite').then(
    (vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
  );

const app = express();
app.use(
  viteDevServer
    ? viteDevServer.middlewares
    : express.static('build/client'),
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:remix/server-build')
  // @ts-expect-error This code branch is used only when that file is built
  // eslint-disable-next-line import/extensions
  : await import('./build/server/index.js');

// Fork entity manager on every request
app.use(serverContainer.emForkMiddleware);
app.all('*', createRequestHandler({ build }));

app.listen(3005, () => console.log('App listening on http://localhost:3005'));
