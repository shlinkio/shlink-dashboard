import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import clsx from 'clsx';
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
      <SimpleCard bodyClassName="!tw-p-0 tw-overflow-hidden tw-rounded-[inherit]">
        {servers.map((server) => (
          <Link
            key={server.publicId}
            to={`/server/${server.publicId}`}
            className={clsx(
              'tw-flex tw-justify-between tw-items-center tw-py-3 tw-px-4',
              'tw-border-b last:tw-border-0 tw-border-b-[var(--border-color)] hover:tw-bg-[var(--secondary-color)]',
            )}
          >
            <span>{server.name}</span>
            <FontAwesomeIcon icon={faChevronRight} />
          </Link>
        ))}
      </SimpleCard>
    </Layout>
  );
}
