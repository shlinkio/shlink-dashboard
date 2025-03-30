import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { SimpleCard, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { LoaderFunctionArgs } from 'react-router';
import { href, Link , useLoaderData } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { useSession } from '../../auth/session-context';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { ServersService } from '../../servers/ServersService.server';
import { ensureNotManaged } from '../users/utils.server';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const sessionData = await ensureNotManaged(request, authHelper);
  const populateUsers = sessionData.role === 'admin';
  const servers = await serversService.getUserServers(sessionData.userId, { populateUsers });

  return {
    servers: servers.map(({ users, ...rest }) => ({
      ...rest,
      usersCount: populateUsers ? users.count() : undefined,
    })),
  };
}

export default function ManageServers() {
  const session = useSession();
  const { servers } = useLoaderData<typeof loader>();

  return (
    <Layout className="tw:flex tw:flex-col tw:gap-y-4">
      <SimpleCard bodyClassName="tw:flex tw:flex-col tw:gap-y-4">
        <Table
          header={
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Base URL</Table.Cell>
              {session?.role === 'admin' && <Table.Cell>Users</Table.Cell>}
            </Table.Row>
          }
        >
          {servers.length === 0 && (
            <Table.Row className="tw:text-center">
              <Table.Cell colSpan={3} className="tw:italic">No servers found</Table.Cell>
            </Table.Row>
          )}
          {servers.map((server) => (
            <Table.Row key={server.publicId}>
              <Table.Cell>
                <Link className="tw:font-bold" to={href('/server/:serverId', { serverId: server.publicId })}>
                  {server.name}
                </Link>
              </Table.Cell>
              <Table.Cell>{server.baseUrl}</Table.Cell>
              {server.usersCount !== undefined && (
                <Table.Cell>
                  <div className="tw:flex tw:items-center tw:gap-x-1">
                    <FontAwesomeIcon icon={faUsers} />
                    <span className="tw:sr-only">This server has</span>
                    <b data-testid={`users-count-${server.publicId}`}>{server.usersCount}</b>
                    <span className="tw:sr-only">user{server.usersCount === 1 ? '' : 's'}, including yourself.</span>
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))}
        </Table>
      </SimpleCard>
    </Layout>
  );
}
