import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { ServersService } from '../../servers/ServersService.server';
import { WelcomeCard } from './WelcomeCard';

export async function loader(
  { request }: LoaderFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const sessionData = await authHelper.getSession(request, '/login');
  const servers = await serversService.getUserServers(sessionData.userId);

  return { servers };
}

export default function Index() {
  const { servers } = useLoaderData<typeof loader>();

  return (
    <Layout>
      <div className="md:tw-flex md:tw-items-center md:tw-h-full md:tw-pb-0 tw-pb-3">
        <div className="tw-mx-auto xl:tw-w-1/2 lg:tw-w-3/4 tw-w-full">
          <WelcomeCard servers={servers} />
        </div>
      </div>
    </Layout>
  );
}
