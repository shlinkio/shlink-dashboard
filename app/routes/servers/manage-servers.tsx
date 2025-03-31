import { type LoaderFunctionArgs, Outlet } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { ensureNotManaged } from '../users/utils.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  await ensureNotManaged(request, authHelper);
}

export default function ManageServers() {
  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-4">
      <Outlet />
    </Layout>
  );
}
