import type { ActionFunctionArgs } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import { serverContainer } from '../container/container.server';

export function loader(
  { request }: ActionFunctionArgs,
  authenticator: Authenticator = serverContainer[Authenticator.name],
) {
  return authenticator.logout(request, { redirectTo: '/login' });
}
