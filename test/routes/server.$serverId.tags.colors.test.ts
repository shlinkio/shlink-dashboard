import type { ActionFunctionArgs } from '@remix-run/node';
import { fromPartial } from '@total-typescript/shoehorn';
import { action } from '../../app/routes/server.$serverId.tags.colors';
import type { TagsService } from '../../app/tags/TagsService.server';

describe('server.$serverId.tags.colors', () => {
  const updateTagColors = vi.fn();
  let tagsService: TagsService;

  beforeEach(() => {
    tagsService = fromPartial<TagsService>({ updateTagColors });
  });

  it('updates tags in action and returns response', async () => {
    const colors = { foo: 'red' };
    const request = fromPartial<ActionFunctionArgs['request']>({ json: vi.fn().mockResolvedValue(colors) });

    const resp = await action(fromPartial({ params: { serverId: '123' }, request }), tagsService);

    expect(updateTagColors).toHaveBeenCalled();
    expect(resp.status).toEqual(204);
  });
});
