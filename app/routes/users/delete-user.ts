import type { ActionFunctionArgs } from 'react-router';
import { serverContainer } from '../../container/container.server';
import { UsersService } from '../../users/UsersService.server';

export async function action(
  { request }: ActionFunctionArgs,
  usersService: UsersService = serverContainer[UsersService.name],
) {
  const { userPublicId } = await request.json();
  await usersService.deleteUser(userPublicId);
}
