import type { RouteConfig } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

// eslint-disable-next-line no-restricted-exports
export default [
  index('./routes/index/home.tsx'),
  route('/login', './routes/login.tsx'),
  route('/logout', './routes/logout.ts'),
  route('/settings/*', './routes/settings.tsx'),

  // Server-specific routes
  route('/server/:serverId/shlink-api/:method', './routes/shlink-api-rpc-proxy.ts'),
  route('/server/:serverId/tags/colors', './routes/save-tags-colors.ts'),
  route('/server/:serverId/*', './routes/shlink-component-wrapper.tsx'),

  // Users management
  route('/users/manage/:page', './routes/users/manage-users.tsx'),

  // TODO Servers management
] satisfies RouteConfig;
