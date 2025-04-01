import { Outlet } from 'react-router';
import { Layout } from '../../common/Layout';
import { authMiddleware, ensureAdminMiddleware } from '../../middleware/middleware.server';

export const unstable_middleware = [authMiddleware, ensureAdminMiddleware];

export default function ManageUsers() {
  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-4">
      <Outlet />
    </Layout>
  );
}
