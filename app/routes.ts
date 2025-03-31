import type { RouteConfig } from '@react-router/dev/routes';
import { index, layout, prefix, route } from '@react-router/dev/routes';

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
  layout('routes/users/manage-users.tsx', prefix('/manage-users', [
    route('create', './routes/users/create-user.tsx'),
    route('delete', './routes/users/delete-user.ts'),
    route('edit/:userId', './routes/users/edit-user.tsx'),
    route(':page?', './routes/users/list-users.tsx'),
  ])),

  // Server management
  layout('./routes/servers/manage-servers.tsx', prefix('/manage-servers', [
    route('create', './routes/servers/create-server.tsx'),
    route(':page?', './routes/servers/list-servers.tsx'),
  ])),
] satisfies RouteConfig;
