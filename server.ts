import { createRequestHandler } from '@react-router/express';
import express from 'express';
import { serverContainer } from './app/container/container.server';

const viteDevServer = process.env.NODE_ENV === 'production'
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
    : express.static('client'),
);

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
  // @ts-expect-error This code branch is used only when that file is built
  : await import('./server/index.js');

// Fork entity manager on every request
app.use(serverContainer.emForkMiddleware);
app.all('*', createRequestHandler({ build }));

app.listen(3005, () => console.log('App listening on http://localhost:3005'));
