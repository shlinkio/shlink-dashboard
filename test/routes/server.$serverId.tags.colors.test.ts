import type { ActionFunctionArgs } from '@remix-run/node';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Authenticator } from 'remix-auth';
import type { SessionData } from '../../app/auth/session.server';
import { action } from '../../app/routes/server.$serverId.tags.colors';
import type { TagsService } from '../../app/tags/TagsService.server';

describe('server.$serverId.tags.colors', () => {
  const updateTagColors = vi.fn();
  const tagsService = fromPartial<TagsService>({ updateTagColors });
  const isAuthenticated = vi.fn().mockResolvedValue(null);
  const authenticator = fromPartial<Authenticator<SessionData>>({ isAuthenticated });

  const callAction = (args: ActionFunctionArgs) => action(args, tagsService, authenticator);

  it('skips updates if there is no user authenticated', async () => {
    const request = fromPartial<ActionFunctionArgs['request']>({});

    const resp = await callAction(fromPartial({ params: { serverId: '123' }, request }));

    expect(resp.status).toEqual(204);
    expect(isAuthenticated).toHaveBeenCalledWith(request);
    expect(updateTagColors).not.toHaveBeenCalled();
  });

  it('updates tags in action and returns response', async () => {
    isAuthenticated.mockResolvedValue({ userId: 1 });

    const colors = { foo: 'red' };
    const request = fromPartial<ActionFunctionArgs['request']>({ json: vi.fn().mockResolvedValue(colors) });

    const resp = await callAction(fromPartial({ params: { serverId: '123' }, request }));

    expect(resp.status).toEqual(204);
    expect(isAuthenticated).toHaveBeenCalledWith(request);
    expect(updateTagColors).toHaveBeenCalledWith(expect.objectContaining({ colors, userId: 1 }));
  });
});
