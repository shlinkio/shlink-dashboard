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
import {
  Button,
  determineOrder,
  Menu,
  orderToString,
  Paginator,
  RowDropdown,
  SearchInput,
  SimpleCard,
  stringToOrder,
  Table,
} from '@shlinkio/shlink-frontend-kit';
import { clsx } from 'clsx';
import type { PropsWithChildren } from 'react';
import { useCallback,useState  } from 'react';
import type { LoaderFunctionArgs } from 'react-router';
import { href, Link , useLoaderData, useNavigate,useNavigation  } from 'react-router';
import { useSession } from '../../auth/session-context';
import { serverContainer } from '../../container/container.server';
import type { ListUsersOptions, UserOrderableFields } from '../../users/UsersService.server';
import { UsersService } from '../../users/UsersService.server';
import { requestQueryParams } from '../../utils/request.server';
import { DeleteUserModal } from './DeleteUserModal';
import { RoleBadge } from './RoleBadge';

export async function loader(
  { request, params }: LoaderFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const query = requestQueryParams(request);
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
      <Link className="text-current" to={to}>
        {children}
      </Link>
      {orderDir && (
        <FontAwesomeIcon className="ml-2" icon={orderDir === 'DESC' ? faSortAlphaDesc : faSortAlphaAsc} />
      )}
    </Table.Cell>
  );
}

type UserDropdownItemProps = PropsWithChildren<{
  icon: IconProp;
  to?: string;
  onClick?: () => void;
  danger?: boolean;
}>;

function UserDropdownItem({ children, danger, icon, ...rest }: UserDropdownItemProps) {
  return (
    <Menu.Item className={clsx(danger && 'text-danger!')} {...rest}>
      <FontAwesomeIcon icon={icon} fixedWidth />
      {children}
    </Menu.Item>
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
    orderBy: determineOrder({
      newField,
      currentField: field ?? newField,
      currentOrderDir: dir ?? dirFallback,
    }),
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
      <div className="flex gap-4 flex-col lg:flex-row-reverse">
        <Button to="/manage-users/create">
          <FontAwesomeIcon icon={faPlus} />
          New user
        </Button>
      </div>
      <SimpleCard bodyClassName="flex flex-col gap-y-4" title="Manage users">
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
            <Table.Row className="text-center">
              <Table.Cell colSpan={5} className="italic">Loading...</Table.Cell>
            </Table.Row>
          ) : (
            <>
              {users.length === 0 && (
                <Table.Row className="text-center">
                  <Table.Cell colSpan={4} className="italic">No users found</Table.Cell>
                </Table.Row>
              )}
              {users.map((user) => (
                <Table.Row key={user.publicId} className="relative">
                  <Table.Cell columnName="Created:">{user.createdAt.toLocaleDateString()}</Table.Cell>
                  <Table.Cell columnName="Username:">{user.username}</Table.Cell>
                  <Table.Cell columnName="Display name:">{user.displayName ?? '-'}</Table.Cell>
                  <Table.Cell columnName="Role:"><RoleBadge role={user.role} /></Table.Cell>
                  <Table.Cell
                    className={clsx(
                      'text-right lg:static lg:[&]:border-b-1', // Big screens
                      'absolute top-1.25 right-0 [&]:border-b-0 max-lg:py-0', // Small screens
                    )}
                  >
                    {session?.username !== user.username && (
                      <RowDropdown menuAlignment="right" buttonLabel={`Options for ${user.username}`}>
                        {user.role === 'managed-user' && (
                          <UserDropdownItem
                            icon={faServer}
                            to={href('/manage-users/:userPublicId/edit-servers', { userPublicId: user.publicId })}
                          >
                            Servers
                          </UserDropdownItem>
                        )}
                        <UserDropdownItem
                          icon={faKey}
                          to={href('/manage-users/:userPublicId/reset-password', { userPublicId: user.publicId })}
                        >
                          Reset password
                        </UserDropdownItem>
                        <UserDropdownItem
                          icon={faPencil}
                          to={href('/manage-users/:userPublicId/edit', { userPublicId: user.publicId })}
                        >
                          Edit
                        </UserDropdownItem>
                        <Menu.Separator />
                        <UserDropdownItem
                          danger
                          icon={faTrashCan}
                          onClick={() => {
                            setUserToDelete(user);
                            setDialogOpen(true);
                          }}
                        >
                          Delete
                        </UserDropdownItem>
                      </RowDropdown>
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </>
          )}
        </Table>
        {totalPages >= 2 && (
          <div className="flex justify-center">
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
