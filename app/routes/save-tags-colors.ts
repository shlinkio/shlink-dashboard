import type { ActionFunctionArgs } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import { serverContainer } from '../container/container.server';
import { TagsService } from '../tags/TagsService.server';
import { empty } from '../utils/response.server';

export async function action(
  { params, request, url }: ActionFunctionArgs,
  tagsService: TagsService = serverContainer[TagsService.name],
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const sessionData = await authHelper.getSession(request, url);
  if (!sessionData) {
    return empty();
  }

  const { publicId: userPublicId } = sessionData;
  const { serverId: serverPublicId } = params;
  const colors = await request.json();

  await tagsService.updateTagColors({ colors, userPublicId, serverPublicId });

  return empty();
}
