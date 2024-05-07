import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { TagsService } from '../tags/TagsService.server';

export async function action({ params, request }: ActionFunctionArgs, tagsService = new TagsService()) {
  const { serverId: serverPublicId } = params;
  // TODO Get UserID from session
  const userId = 1;
  const colors = await request.json();

  await tagsService.updateTagColors({ colors, userId, serverPublicId });

  // TODO Return new colors
  return json({});
}
