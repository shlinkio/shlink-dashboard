import type { ActionFunctionArgs } from '@remix-run/node';
import { AuthHelper } from '../auth/auth-helper.server';
import { serverContainer } from '../container/container.server';

export async function loader(
  { request }: ActionFunctionArgs,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  return authHelper.logout(request);
}
