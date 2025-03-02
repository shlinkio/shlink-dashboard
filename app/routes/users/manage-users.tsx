import { faSortAlphaAsc, faSortAlphaDesc } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Order, OrderDir } from '@shlinkio/shlink-frontend-kit';
import { orderToString } from '@shlinkio/shlink-frontend-kit';
import { determineOrderDir, SimpleCard, stringToOrder } from '@shlinkio/shlink-frontend-kit';
import type { PropsWithChildren } from 'react';
import { useCallback } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { href, useLoaderData } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { Layout } from '../../common/Layout';
import { serverContainer } from '../../container/container.server';
import { Paginator } from '../../fe-kit/Paginator';
import { Table } from '../../fe-kit/Table';
import type { UserOrderableFields } from '../../users/UsersService.server';
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
  const currentPage = Number(page);
  const query = new URL(request.url).searchParams;
  const orderByParam = query.get('orderBy');
  const orderBy = orderByParam ? stringToOrder<UserOrderableFields>(orderByParam) : {};
  const usersList = await usersService.listUsers({ page: currentPage, orderBy });

  return { ...usersList, orderBy, currentPage };
}

function determineOrder(
  currentField: UserOrderableFields = 'createdAt',
  newField?: UserOrderableFields,
  currentOrderDir?: OrderDir,
): Order<UserOrderableFields> {
  return { field: newField, dir: determineOrderDir(currentField, newField, currentOrderDir) };
}

function HeaderCell({ orderDir, href, children }: PropsWithChildren<{ orderDir: OrderDir; href: string }>) {
  return (
    <Table.Cell>
      <a className="tw:text-current!" href={href}>
        {children}
      </a>
      {orderDir && (
        <FontAwesomeIcon className="tw:ml-2" icon={orderDir === 'DESC' ? faSortAlphaDesc : faSortAlphaAsc} />
      )}
    </Table.Cell>
  );
}

export default function ManageUsers() {
  const { users, totalPages, orderBy, currentPage } = useLoaderData<typeof loader>();
  const { field, dir } = orderBy;
  const urlForPage = useCallback((page: number, orderBy?: Order<UserOrderableFields>) => {
    const query = new URLSearchParams();
    if (orderBy) {
      query.set('orderBy', orderToString(orderBy) ?? '');
    } else if (field) {
      query.set('orderBy', orderToString({ field, dir: dir ?? 'ASC' }) ?? '');
    }
    const queryString = query.size > 0 ? `?${query.toString()}` : '';
    const baseUrl = href('/manage-users/:page', { page: `${page}` });

    return `${baseUrl}${queryString}`;
  }, [dir, field]);

  return (
    <Layout>
      <SimpleCard bodyClassName="tw:flex tw:flex-col tw:gap-y-3">
        <Table
          header={
            <Table.Row>
              <HeaderCell
                href={urlForPage(currentPage, determineOrder(field, 'createdAt', dir ?? 'ASC'))}
                orderDir={(!field || field === 'createdAt') ? (dir ?? 'ASC') : undefined}
              >
                Created
              </HeaderCell>
              <HeaderCell
                href={urlForPage(currentPage, determineOrder(field, 'username', dir))}
                orderDir={field === 'username' ? dir : undefined}
              >
                Username
              </HeaderCell>
              <HeaderCell
                href={urlForPage(currentPage, determineOrder(field, 'displayName', dir))}
                orderDir={field === 'displayName' ? dir : undefined}
              >
                Display name
              </HeaderCell>
              <HeaderCell
                href={urlForPage(currentPage, determineOrder(field, 'role', dir))}
                orderDir={field === 'role' ? dir : undefined}
              >
                Role
              </HeaderCell>
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
              <Table.Cell>{user.createdAt.toLocaleDateString()}</Table.Cell>
              <Table.Cell>{user.username}</Table.Cell>
              <Table.Cell>{user.displayName ?? '-'}</Table.Cell>
              <Table.Cell><RoleBadge role={user.role}/></Table.Cell>
            </Table.Row>
          ))}
        </Table>
        {totalPages >= 2 && (
          <div className="tw:flex tw:justify-center">
            <Paginator pagesCount={totalPages} currentPage={currentPage} urlForPage={urlForPage} />
          </div>
        )}
      </SimpleCard>
    </Layout>
  );
}
