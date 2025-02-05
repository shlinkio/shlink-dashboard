import type { LoaderFunctionArgs } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { SettingsService } from '../../settings/SettingsService.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  settingsService: SettingsService = serverContainer[SettingsService.name],
) {
  const { userId, role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw new Response('Not found', { status: 404 });
  }

  return settingsService.userSettings(userId);
}

export default function Users() {
  return (
    <Layout>
      <>User management</>
    </Layout>
  );
}
