import { Outlet } from 'react-router';
import { Layout } from '../../common/Layout';
import { authMiddleware, ensureNotManagedMiddleware } from '../../middleware/middleware.server';

export const middleware = [authMiddleware, ensureNotManagedMiddleware];

export default function ManageServers() {
  return (
    <Layout flexColumn>
      <Outlet />
    </Layout>
  );
}
