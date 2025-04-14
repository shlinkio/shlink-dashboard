import type { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faKey,
  faPencil,
  faPlus,
  faServer,
  faSortAlphaAsc,
  faSortAlphaDesc,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { mergeDeepRight } from '@shlinkio/data-manipulation';
import type { OrderDir } from '@shlinkio/shlink-frontend-kit';
import { determineOrder, orderToString , stringToOrder } from '@shlinkio/shlink-frontend-kit';
import { Button, Paginator, SearchInput, SimpleCard, Table } from '@shlinkio/shlink-frontend-kit/tailwind';
import clsx from 'clsx';
import type { PropsWithChildren } from 'react';
import { useCallback,useState  } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { href, Link , useLoaderData, useNavigate,useNavigation  } from 'react-router';
import { useSession } from '../../auth/session-context';
import { serverContainer } from '../../container/container.server';
import type { ListUsersOptions, UserOrderableFields } from '../../users/UsersService.server';
import { UsersService } from '../../users/UsersService.server';
import { DeleteUserModal } from './DeleteUserModal';
import { RoleBadge } from './RoleBadge';

export async function loader(
  { request, params }: LoaderFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const query = new URL(request.url).searchParams;
  const orderByParam = query.get('order-by');
  const orderBy = orderByParam ? stringToOrder<UserOrderableFields>(orderByParam) : {};
  const currentParams = {
    page: Number(params.page ?? '1'),
    orderBy,
    searchTerm: query.get('search-term') ?? undefined,
  } satisfies ListUsersOptions;
  const usersList = await usersService.listUsers(currentParams);

  return { ...usersList, currentParams };
}

function HeaderCell({ orderDir, to, children }: PropsWithChildren<{ orderDir: OrderDir; to: string }>) {
  return (
    <Table.Cell aria-sort={orderDir && (orderDir === 'ASC' ? 'ascending' : 'descending')}>
      <Link className="tw:text-current" to={to}>
        {children}
      </Link>
      {orderDir && (
        <FontAwesomeIcon className="tw:ml-2" icon={orderDir === 'DESC' ? faSortAlphaDesc : faSortAlphaAsc} />
      )}
    </Table.Cell>
  );
}

type UserButtonProps = {
  label: string;
  icon: IconProp;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
};

function UserButton({ label, danger, icon, ...rest }: UserButtonProps) {
  return (
    <Button
      inline
      size="sm"
      variant={danger ? 'danger' : 'secondary'}
      aria-label={label}
      title={label}
      {...rest}
    >
      <FontAwesomeIcon icon={icon} />
    </Button>
  );
}

export default function ListUsers() {
  const session = useSession();
  const navigation = useNavigation();
  const navigate = useNavigate();
  const { users, totalPages, currentParams } = useLoaderData<typeof loader>();
  const { field, dir } = currentParams.orderBy;

  const urlForParams = useCallback((newParams: ListUsersOptions) => {
    const query = new URLSearchParams();
    const mergedParams = mergeDeepRight(currentParams, newParams);
    const stringifiedOrderBy = orderToString(mergedParams.orderBy ?? {});

    if (stringifiedOrderBy) {
      query.set('order-by', stringifiedOrderBy);
    }
    if (mergedParams.searchTerm) {
      query.set('search-term', mergedParams.searchTerm);
    }

    const queryString = query.size > 0 ? `?${query.toString()}` : '';
    const baseUrl = href('/manage-users/:page', { page: `${mergedParams.page}` });

    return `${baseUrl}${queryString}`;
  }, [currentParams]);
  const headerUrl = useCallback((newField: UserOrderableFields, dirFallback?: OrderDir) => urlForParams({
    page: 1,
    orderBy: determineOrder(field ?? newField, newField, dir ?? dirFallback),
  }), [dir, field, urlForParams]);

  const [userToDelete, setUserToDelete] = useState<typeof users[number]>();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SearchInput
        placeholder="Seacrh users..."
        defaultValue={currentParams.searchTerm}
        onChange={(searchTerm) => navigate(urlForParams({ page: 1, searchTerm }), { replace: true })}
      />
      <div className="tw:flex tw:gap-4 tw:flex-col tw:lg:flex-row-reverse">
        <Button to="/manage-users/create">
          <FontAwesomeIcon icon={faPlus} />
          New user
        </Button>
      </div>
      <SimpleCard bodyClassName="tw:flex tw:flex-col tw:gap-y-4" title="Manage users">
        <Table
          header={
            <Table.Row>
              <HeaderCell
                to={headerUrl('createdAt', 'ASC')}
                orderDir={(!field || field === 'createdAt') ? (dir ?? 'ASC') : undefined}
              >
                Created
              </HeaderCell>
              <HeaderCell to={headerUrl('username')} orderDir={field === 'username' ? dir : undefined}>
                Username
              </HeaderCell>
              <HeaderCell to={headerUrl('displayName')} orderDir={field === 'displayName' ? dir : undefined}>
                Display name
              </HeaderCell>
              <HeaderCell to={headerUrl('role')} orderDir={field === 'role' ? dir : undefined}>
                Role
              </HeaderCell>
              <Table.Cell aria-hidden />
            </Table.Row>
          }
        >
          {navigation.state === 'loading' ? (
            <Table.Row className="tw:text-center">
              <Table.Cell colSpan={5} className="tw:italic">Loading...</Table.Cell>
            </Table.Row>
          ) : (
            <>
              {users.length === 0 && (
                <Table.Row className="tw:text-center">
                  <Table.Cell colSpan={4} className="tw:italic">No users found</Table.Cell>
                </Table.Row>
              )}
              {users.map((user) => (
                <Table.Row key={user.id} className="tw:relative">
                  <Table.Cell columnName="Created:">{user.createdAt.toLocaleDateString()}</Table.Cell>
                  <Table.Cell columnName="Username:">{user.username}</Table.Cell>
                  <Table.Cell columnName="Display name:">{user.displayName ?? '-'}</Table.Cell>
                  <Table.Cell columnName="Role:"><RoleBadge role={user.role} /></Table.Cell>
                  <Table.Cell
                    className={clsx(
                      'tw:lg:static tw:lg:[&]:border-b-1', // Big screens
                      'tw:absolute tw:top-0 tw:right-0 tw:[&]:border-b-0', // Small screens
                    )}
                  >
                    {session?.username !== user.username && (
                      <div className="tw:flex tw:justify-end tw:gap-x-1">
                        {user.role === 'managed-user' && (
                          <UserButton
                            label={`Servers for ${user.username}`}
                            icon={faServer}
                            to={href('/manage-users/edit/:userId/servers', { userId: user.id.toString() })}
                          />
                        )}
                        <UserButton
                          label={`Reset ${user.username} password`}
                          icon={faKey}
                          to={href('/manage-users/reset-password/:userId', { userId: user.id.toString() })}
                        />
                        <UserButton
                          label={`Edit ${user.username}`}
                          icon={faPencil}
                          to={href('/manage-users/edit/:userId', { userId: user.id.toString() })}
                        />
                        <UserButton
                          danger
                          label={`Delete ${user.username}`}
                          icon={faTrashCan}
                          onClick={() => {
                            setUserToDelete(user);
                            setDialogOpen(true);
                          }}
                        />
                      </div>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </>
          )}
        </Table>
        {totalPages >= 2 && (
          <div className="tw:flex tw:justify-center">
            <Paginator
              pagesCount={totalPages}
              currentPage={currentParams.page}
              urlForPage={(page) => urlForParams({ page })}
            />
          </div>
        )}
      </SimpleCard>

      <DeleteUserModal open={dialogOpen} onClose={() => setDialogOpen(false)} userToDelete={userToDelete} />
    </>
  );
}
