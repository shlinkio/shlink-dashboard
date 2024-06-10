import { faChevronRight, faPlus, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import clsx from 'clsx';
import { ExternalLink } from 'react-external-link';
import { Button } from 'reactstrap';
import { Authenticator } from 'remix-auth';
import type { SessionData } from '../auth/session-context';
import { Layout } from '../common/Layout';
import { ShlinkLogo } from '../common/ShlinkLogo';
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
      <div className="md:tw-flex md:tw-items-center md:tw-h-full md:tw-pb-0 tw-pb-3">
        <div className="tw-mx-auto xl:tw-w-1/2 lg:tw-w-3/4 tw-w-full">
          <SimpleCard bodyClassName="!tw-p-0 tw-overflow-hidden tw-rounded-[inherit] tw-flex tw-justify-stretch">
            <div className={clsx(
              'tw-w-4/12 tw-hidden md:tw-flex tw-items-center p-3',
              'tw-border-r tw-border-r-[var(--border-color)]'
            )}>
              <ShlinkLogo />
            </div>
            <div className="md:tw-w-8/12 tw-w-full">
              <h1 className="px-3 py-4 text-center tw-border-b tw-border-b-[var(--border-color)]">Welcome!</h1>
              <div className="md:tw-max-h-64 md:tw-min-h-48 tw-overflow-auto">
                {servers.map((server, index) => (
                  <Link
                    key={`${server.publicId}${index}`}
                    to={`/server/${server.publicId}`}
                    className={clsx(
                      'tw-flex tw-justify-between tw-items-center tw-py-3 tw-px-4',
                      'tw-border-b tw-border-b-[var(--border-color)] hover:tw-bg-[var(--secondary-color)]',
                    )}
                  >
                    <span>{server.name}</span>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </Link>
                ))}
                {servers.length === 0 && (
                  <div className="tw-p-6 tw-text-center tw-flex tw-flex-col tw-gap-8">
                    <p className="tw-text-xl">
                      This application will help you manage your Shlink servers.
                    </p>
                    <p>
                      <Button color="primary" outline size="lg">
                        <FontAwesomeIcon icon={faPlus} className="tw-mr-2" />
                        Add a server
                      </Button>
                    </p>
                    <p>
                      <ExternalLink href="https://app.shlink.io/server/create">
                        Learn more about Shlink <FontAwesomeIcon icon={faUpRightFromSquare} />
                      </ExternalLink>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </SimpleCard>
        </div>
      </div>
    </Layout>
  );
}
