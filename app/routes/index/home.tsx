import type { LoaderFunctionArgs } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { CenteredContentLayout } from '../../common/CenteredContentLayout';
import { serverContainer } from '../../container/container.server';
import { ServersService } from '../../servers/ServersService.server';
import type { RouteComponentProps } from '../types';
import type { Route } from './+types/home';
import { WelcomeCard } from './WelcomeCard';

export async function loader(
  { request }: LoaderFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const sessionData = await authHelper.getSession(request, '/login');
  const servers = await serversService.getUserServers(sessionData.publicId);

  return { servers };
}

export default function Home({ loaderData }: RouteComponentProps<Route.ComponentProps>) {
  const { servers } = loaderData;

  return (
    <CenteredContentLayout>
      <WelcomeCard servers={servers} />
    </CenteredContentLayout>
  );
}
