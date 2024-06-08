import type { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { Authenticator } from 'remix-auth';
import type { SessionData } from '../auth/session-context';
import { Layout } from '../common/Layout';
import { serverContainer } from '../container/container.server';
import { ServersService } from '../servers/ServersService.server';

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
      <SimpleCard>
        {servers.map((server) => (
          <div key={server.publicId}>
            <Link to={`/server/${server.publicId}`}>{server.name}</Link>
          </div>
        ))}
      </SimpleCard>
    </Layout>
  );
}
