import { Outlet } from 'react-router';
import { Layout } from '../../common/Layout';
import { authMiddleware, ensureAdminMiddleware } from '../../middleware/middleware.server';

export const unstable_middleware = [authMiddleware, ensureAdminMiddleware];

export default function ManageUsers() {
  return (
    <Layout flexColumn>
      <Outlet />
    </Layout>
  );
}
