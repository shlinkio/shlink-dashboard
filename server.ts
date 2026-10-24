import { createRequestHandler } from '@react-router/express';
import express from 'express';

const { NODE_ENV, SHLINK_DASHBOARD_PORT = '3005', SHLINK_DASHBOARD_TRUST_PROXY } = process.env;
const isProd = NODE_ENV === 'production';

/**
 * Maps the raw env var into a value supported by express' "trust proxy" setting: a boolean, the number of hops, or
 * a comma-separated list of trusted addresses/subnets (e.g. "loopback, 10.0.0.0/8")
 */
const parseTrustProxy = (value: string): boolean | number | string => {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === 'false') {
    return normalized === 'true';
  }

  return /^\d+$/.test(normalized) ? Number(normalized) : value;
};

const viteDevServer = isProd
  ? null
  : await import('vite').then((vite) =>
      vite.createServer({
        server: { middlewareMode: true },
      }),
    );

const app = express();
if (SHLINK_DASHBOARD_TRUST_PROXY) {
  app.set('trust proxy', parseTrustProxy(SHLINK_DASHBOARD_TRUST_PROXY));
}
app.use(viteDevServer ? viteDevServer.middlewares : express.static('client'));

const build = viteDevServer
  ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
  : // @ts-expect-error This code branch is used only when that file is built
    await import('./server/index.js');

app.all('*splat', createRequestHandler({ build }));

const port = Number(SHLINK_DASHBOARD_PORT);
app.listen(port, () => console.log(`App listening on http://localhost:${port}`));
