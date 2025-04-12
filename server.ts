import { createRequestHandler } from '@react-router/express';
import express from 'express';

const { NODE_ENV, SHLINK_DASHBOARD_PORT = '3005' } = process.env;
const isProd = NODE_ENV === 'production';

const viteDevServer = isProd
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
const { serverContainer } = isProd
  ? build
  : await import('./app/container/container.server');
app.use(serverContainer.emForkMiddleware);
app.all('*splat', createRequestHandler({ build }));

const port = Number(SHLINK_DASHBOARD_PORT);
app.listen(port, () => console.log(`App listening on http://localhost:${port}`));
