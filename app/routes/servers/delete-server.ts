import type { ActionFunctionArgs } from 'react-router';
import { serverContainer } from '../../container/container.server';
import { sessionContext } from '../../middleware/middleware.server';
import { ServersService } from '../../servers/ServersService.server';

export async function action(
  { request, context }: ActionFunctionArgs,
  serversService: ServersService = serverContainer[ServersService.name],
) {
  const session = context.get(sessionContext);
  const { serverPublicId } = await request.json();
  await serversService.deleteServerForUser(session.publicId, serverPublicId);
}
