import { SimpleCard } from '@shlinkio/shlink-frontend-kit';
import { useCallback } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { useParams } from 'react-router';
import { useLoaderData } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { Paginator } from '../../fe-kit/Paginator';
import { Table } from '../../fe-kit/Table';
import { UsersService } from '../../users/UsersService.server';
import { RoleBadge } from './RoleBadge';

export async function loader(
  { request, params }: LoaderFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw new Response('Not found', { status: 404 });
  }

  const { page } = params;
  return usersService.listUsers({ page: Number(page) });
}

export default function ManageUsers() {
  const { users, totalPages } = useLoaderData<typeof loader>();
  const { page } = useParams();
  const urlForPage = useCallback((page: number) => `/users/manage/${page}`, []);

  return (
    <Layout>
      <SimpleCard bodyClassName="tw:flex tw:flex-col tw:gap-y-3">
        <Table
          header={
            <Table.Row>
              <Table.Cell>Username</Table.Cell>
              <Table.Cell>Display name</Table.Cell>
              <Table.Cell>Role</Table.Cell>
            </Table.Row>
          }
        >
          {users.length === 0 && (
            <Table.Row className="tw:text-center">
              <Table.Cell colSpan={3} className="tw:italic">No users found</Table.Cell>
            </Table.Row>
          )}
          {users.map((user) => (
            <Table.Row key={user.id}>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.displayName ?? '-'}</Table.Cell>
              <Table.Cell><RoleBadge role={user.role}/></Table.Cell>
            </Table.Row>
          ))}
        </Table>
        {totalPages >= 2 && (
          <div className="tw:flex tw:justify-center">
            <Paginator pagesCount={totalPages} currentPage={Number(page)} urlForPage={urlForPage} />
          </div>
        )}
      </SimpleCard>
    </Layout>
  );
}
