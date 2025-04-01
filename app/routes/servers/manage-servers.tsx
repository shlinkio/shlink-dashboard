import { Outlet } from 'react-router';
import { Layout } from '../../common/Layout';
import { authMiddleware, ensureNotManagedMiddleware } from '../../middleware/middleware.server';

export const unstable_middleware = [authMiddleware, ensureNotManagedMiddleware];

export default function ManageServers() {
  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-4">
      <Outlet />
    </Layout>
  );
}
