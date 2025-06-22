import { faPencil, faPlus, faTrashCan, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Dropdown, RowDropdown, SearchInput, SimpleCard, Table } from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import { useState } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { href, Link , useLoaderData,useNavigate  } from 'react-router';
import { useSession } from '../../auth/session-context';
import { serverContainer } from '../../container/container.server';
import type { PlainServer } from '../../entities/Server';
import { sessionContext } from '../../middleware/middleware.server';
import { ServersService } from '../../servers/ServersService.server';
import { requestQueryParams } from '../../utils/request.server';
import { DeleteServerModal } from './DeleteServerModal';

export async function loader(
  { request, context, params }: LoaderFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const query = requestQueryParams(request);
  const currentSearchTerm = query.get('search-term') ?? undefined;
  const page = Number(params.page ?? 1);
  const itemsPerPage = query.has('items-per-page') ? Number(query.get('items-per-page')) : undefined;
  const sessionData = context.get(sessionContext);
  const populateUsers = sessionData.role === 'admin' && !query.has('no-users');
  const servers = await serversService.getUserServers(sessionData.publicId, {
    populateUsers,
    searchTerm: currentSearchTerm,
    page,
    itemsPerPage,
  });

  return {
    servers: servers.map(({ users, ...rest }) => ({
      ...rest,
      usersCount: populateUsers ? users.count() : undefined,
    })),
    currentSearchTerm,
  };
}

export default function ListServers() {
  const session = useSession();
  const navigate = useNavigate();
  const { servers, currentSearchTerm } = useLoaderData<typeof loader>();

  const [serverToDelete, setServerToDelete] = useState<PlainServer>();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SearchInput
        placeholder="Search servers..."
        defaultValue={currentSearchTerm}
        onChange={(searchTerm) => navigate(searchTerm ? `?search-term=${searchTerm}` : '?', { replace: true })}
      />
      <div className="flex gap-4 flex-col lg:flex-row-reverse">
        <Button to="/manage-servers/create">
          <FontAwesomeIcon icon={faPlus} />
          Add a server
        </Button>
      </div>
      <SimpleCard bodyClassName="flex flex-col gap-y-4" title="Shlink servers">
        <Table
          header={
            <Table.Row>
              <Table.Cell>Name</Table.Cell>
              <Table.Cell>Base URL</Table.Cell>
              {session?.role === 'admin' && <Table.Cell>Users</Table.Cell>}
              <Table.Cell aria-hidden />
            </Table.Row>
          }
        >
          {servers.length === 0 && (
            <Table.Row className="text-center">
              <Table.Cell colSpan={4} className="italic">No servers found</Table.Cell>
            </Table.Row>
          )}
          {servers.map((server) => (
            <Table.Row key={server.publicId} className="relative">
              <Table.Cell columnName="Name:">
                <Link className="font-bold" to={href('/server/:serverId', { serverId: server.publicId })}>
                  {server.name}
                </Link>
              </Table.Cell>
              <Table.Cell columnName="Base URL:">{server.baseUrl}</Table.Cell>
              {server.usersCount !== undefined && (
                <Table.Cell columnName="Users:">
                  <div className="inline-flex items-center gap-x-1">
                    <FontAwesomeIcon icon={faUsers} className="max-lg:hidden" />
                    <span className="sr-only">This server has</span>
                    <b data-testid={`users-count-${server.publicId}`}>{server.usersCount}</b>
                    <span className="sr-only">user{server.usersCount === 1 ? '' : 's'}, including yourself.</span>
                  </div>
                </Table.Cell>
              )}
              <Table.Cell
                className={clsx(
                  'text-right lg:[&]:border-b-1', // Big screens
                  'max-lg:absolute top-1.25 right-0 [&]:border-b-0 max-lg:py-0', // Small screens
                )}
              >
                <RowDropdown menuAlignment="right" buttonLabel={`Options for ${server.name}`}>
                  <Dropdown.Item to={href('/manage-servers/:serverPublicId/edit', { serverPublicId: server.publicId })}>
                    <FontAwesomeIcon icon={faPencil} fixedWidth />
                    Edit server
                  </Dropdown.Item>
                  <Dropdown.Item
                    className="text-danger!"
                    onClick={() => {
                      setServerToDelete(server);
                      setDialogOpen(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrashCan} fixedWidth />
                    Delete server
                  </Dropdown.Item>
                </RowDropdown>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table>
      </SimpleCard>

      <DeleteServerModal
        serverToDelete={serverToDelete}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </>
  );
}
