import type { ActionFunctionArgs } from 'react-router';
import { AuthHelper } from '../../auth/auth-helper.server';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';
import { ensureAdmin } from './utils';

export async function action(
  { request }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  await ensureAdmin(request, authHelper);

  const { userId } = await request.json();
  await usersService.deleteUser(userId);
}
