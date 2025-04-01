import { faPlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, SimpleCard, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import type { LoaderFunctionArgs, unstable_RouterContextProvider } from 'react-router';
import { href, Link , useLoaderData } from 'react-router';
import { useSession } from '../../auth/session-context';
import { serverContainer } from '../../container/container.server';
import { sessionContext } from '../../middleware/middleware.server';
import { ServersService } from '../../servers/ServersService.server';

export async function loader(
  { context }: LoaderFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const sessionData = (context as unstable_RouterContextProvider).get(sessionContext);
  const populateUsers = sessionData.role === 'admin';
  const servers = await serversService.getUserServers(sessionData.userId, { populateUsers });

  return {
    servers: servers.map(({ users, ...rest }) => ({
      ...rest,
      usersCount: populateUsers ? users.count() : undefined,
    })),
  };
}

export default function ListServers() {
  const session = useSession();
  const { servers } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="tw:flex tw:gap-4 tw:flex-col tw:lg:flex-row-reverse">
        <Button to="/manage-servers/create">
          <FontAwesomeIcon icon={faPlus} />
          Add a server
        </Button>
      </div>
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
              <Table.Cell colSpan={4} className="tw:italic">No servers found</Table.Cell>
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
    </>
  );
}
