import type { ActionFunctionArgs } from '@remix-run/node';
import { Authenticator } from 'remix-auth';
import type { SessionData } from '../auth/session.server';
import { serverContainer } from '../container/container.server';
import { TagsService } from '../tags/TagsService.server';
import { empty } from '../utils/response.server';

export async function action(
  { params, request }: ActionFunctionArgs,
  tagsService: TagsService = serverContainer[TagsService.name],
  authenticator: Authenticator<SessionData> = serverContainer[Authenticator.name],
) {
  const sessionData = await authenticator.isAuthenticated(request);
  if (!sessionData) {
    return empty();
  }

  const { userId } = sessionData;
  const { serverId: serverPublicId } = params;
  const colors = await request.json();

  await tagsService.updateTagColors({ colors, userId, serverPublicId });

  return empty();
}
