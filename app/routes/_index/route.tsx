import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { Authenticator } from 'remix-auth';
import type { SessionData } from '../../auth/session-context';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { ServersService } from '../../servers/ServersService.server';
import { WelcomeCard } from './WelcomeCard';

export async function loader(
  { request }: LoaderFunctionArgs,
  authenticator: Authenticator<SessionData> = serverContainer[Authenticator.name],
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const session = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });
  const servers = await serversService.getUserServers(session.userId);

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
