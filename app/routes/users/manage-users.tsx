import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { Table } from '../../common/Table';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';
import { RoleBadge } from './RoleBadge';

export async function loader(
  { request }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw new Response('Not found', { status: 404 });
  }

  return usersService.listUsers({});
}

export default function Users() {
  const users = useLoaderData<typeof loader>();

  return (
    <Layout>
      <SimpleCard>
        <Table
          header={
            <Table.Row>
              <Table.Cell>Username</Table.Cell>
              <Table.Cell>Display name</Table.Cell>
              <Table.Cell>Role</Table.Cell>
            </Table.Row>
          }
        >
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.displayName ?? '-'}</Table.Cell>
              <Table.Cell><RoleBadge role={user.role} /></Table.Cell>
            </Table.Row>
          ))}
        </Table>
        <table className="table table-hover mb-0">
          <thead>
            <tr>
              <th className="tw:p-1">Username</th>
              <th className="tw:p-1">Display name</th>
              <th className="tw:p-1">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="">{user.username}</td>
                <td className="">{user.displayName ?? '-'}</td>
                <td className=""><RoleBadge role={user.role}/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </SimpleCard>
    </Layout>
  );
}
