import type { RouteConfig } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

// eslint-disable-next-line no-restricted-exports
export default [
  index('./routes/_index/route.tsx'),
  route('/login', './routes/login.tsx'),
  route('/logout', './routes/logout.ts'),
  route('/settings/*', './routes/settings.$.tsx'),

  // RPC-style proxy for Shlink API
  route('/server/:serverId/shlink-api/:method', './routes/server.$serverId.shlink-api.$method.ts'),
  // ShlinkWebComponent wrapper
  route('/server/:serverId/*', './routes/server.$serverId.$.tsx'),
  // Saves tag colors
  route('/server/:serverId/tags/colors', './routes/server.$serverId.tags.colors.ts'),

  // Users management
  route('/users/manage/:page', './routes/users/manage-users.tsx'),

  // TODO Servers management
] satisfies RouteConfig;
