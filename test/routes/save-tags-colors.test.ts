import { fromPartial } from '@total-typescript/shoehorn';
import type { ActionFunctionArgs } from 'react-router';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import { action } from '../../app/routes/save-tags-colors';
import type { TagsService } from '../../app/tags/TagsService.server';

describe('save-tags-colors', () => {
  const updateTagColors = vi.fn();
  const tagsService = fromPartial<TagsService>({ updateTagColors });
  const getSession = vi.fn().mockResolvedValue(null);
  const authHelper = fromPartial<AuthHelper>({ getSession });

  const callAction = (args: ActionFunctionArgs) => action(args, tagsService, authHelper);

  it('skips updates if there is no user authenticated', async () => {
    const request = fromPartial<ActionFunctionArgs['request']>({});

    const resp = await callAction(fromPartial({ params: { serverId: '123' }, request }));

    expect(resp.status).toEqual(204);
    expect(getSession).toHaveBeenCalledWith(request);
    expect(updateTagColors).not.toHaveBeenCalled();
  });

  it('updates tags in action and returns response', async () => {
    getSession.mockResolvedValue({ userId: '1' });

    const colors = { foo: 'red' };
    const request = fromPartial<ActionFunctionArgs['request']>({ json: vi.fn().mockResolvedValue(colors) });

    const resp = await callAction(fromPartial({ params: { serverId: '123' }, request }));

    expect(resp.status).toEqual(204);
    expect(getSession).toHaveBeenCalledWith(request);
    expect(updateTagColors).toHaveBeenCalledWith(expect.objectContaining({ colors, userId: '1' }));
  });
});
