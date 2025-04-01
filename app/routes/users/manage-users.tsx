import type { LoaderFunctionArgs } from 'react-router';
import { Outlet } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { ensureAdmin } from './utils.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  await ensureAdmin(request, authHelper);
}

export default function ManageUsers() {
  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-4">
      <Outlet />
    </Layout>
  );
}
