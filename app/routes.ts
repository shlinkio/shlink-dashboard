import type { RouteConfig } from '@react-router/dev/routes';
import { index, route } from '@react-router/dev/routes';

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
  route('/manage-users/create', './routes/users/create-user.tsx'),
  route('/manage-users/delete', './routes/users/delete-user.ts'),
  route('/manage-users/edit/:userId', './routes/users/edit-user.tsx'),
  route('/manage-users/:page', './routes/users/manage-users.tsx'),

  route('/manage-servers/:page', './routes/servers/manage-servers.tsx'),
] satisfies RouteConfig;
