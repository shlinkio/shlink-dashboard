import type { ActionFunctionArgs } from '@remix-run/node';
import { serverContainer } from '../container/container.server';
import { TagsService } from '../tags/TagsService.server';

export async function action(
  { params, request }: ActionFunctionArgs,
  tagsService: TagsService = serverContainer[TagsService.name],
) {
  const { serverId: serverPublicId } = params;
  // TODO Get UserID from session
  const userId = 1;
  const colors = await request.json();

  await tagsService.updateTagColors({ colors, userId, serverPublicId });

  return new Response(null, { status: 204 });
}
