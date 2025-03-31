import { Outlet } from 'react-router';
import { Layout } from '../../common/Layout';

export default function UsersCommon() {
  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-4">
      <Outlet />
    </Layout>
  );
}
