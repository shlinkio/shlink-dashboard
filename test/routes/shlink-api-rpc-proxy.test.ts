import type { ShlinkApiClient } from '@shlinkio/shlink-js-sdk/api-contract';
import { ErrorType } from '@shlinkio/shlink-js-sdk/api-contract';
import { fromPartial } from '@total-typescript/shoehorn';
import type { ActionFunctionArgs } from 'react-router';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import { action } from '../../app/routes/shlink-api-rpc-proxy';
import type { ServersService } from '../../app/servers/ServersService.server';

describe('shlink-api-rpc-proxy', () => {
  const getByPublicIdAndUser = vi.fn();
  const serversService = fromPartial<ServersService>({ getByPublicIdAndUser });
  const getShortUrl = async (shortCode: string) => {
    if (shortCode === 'throw-error') {
      throw new Error('Error getting short URL');
    }
    return { shortCode };
  };
  const editTag = (oldTag: string, newTag: string) => ({ oldTag, newTag });
  const apiClient = fromPartial<ShlinkApiClient>({ getShortUrl, editTag });
  const createApiClient = vi.fn().mockReturnValue(apiClient);
  const getSession = vi.fn();
  const authHelper = fromPartial<AuthHelper>({ getSession });

  const setUp = () => (args: ActionFunctionArgs) => action(
    args,
    serversService,
    createApiClient,
    authHelper,
    fromPartial({ error: vi.fn() }),
  );

  it('returns error when user is not authenticated', async () => {
    getSession.mockResolvedValue(undefined);
    const action = setUp();

    const resp = await action(fromPartial({ request: {} }));
    const respPayload = await resp.json();

    expect(resp.status).toEqual(403);
    expect(respPayload).toEqual({
      status: 403,
      type: 'https://shlink.io/api/error/access-denied',
      title: 'Access denied',
      detail: 'You need to log-in to fetch data from Shlink',
    });
    expect(getSession).toHaveBeenCalled();
    expect(getByPublicIdAndUser).not.toHaveBeenCalled();
    expect(createApiClient).not.toHaveBeenCalled();
  });

  it('returns error if server is not found', async () => {
    getSession.mockResolvedValue({ userId: '123' });
    getByPublicIdAndUser.mockRejectedValue(new Error('Server not found'));
    const action = setUp();

    const serverId = 'abc123';
    const resp = await action(fromPartial({ request: {}, params: { serverId } }));
    const respPayload = await resp.json();

    expect(resp.status).toEqual(404);
    expect(respPayload).toEqual({
      status: 404,
      type: ErrorType.NOT_FOUND,
      title: 'Server not found',
      detail: `Server with ID ${serverId} not found`,
      serverId,
    });
    expect(getSession).toHaveBeenCalled();
    expect(getByPublicIdAndUser).toHaveBeenCalled();
    expect(createApiClient).not.toHaveBeenCalled();
  });

  it('returns error if requested method is invalid', async () => {
    getSession.mockResolvedValue({ userId: '123' });
    getByPublicIdAndUser.mockResolvedValue({});
    const action = setUp();

    const method = 'invalid';
    const resp = await action(fromPartial({ request: {}, params: { serverId: 'abc123', method } }));
    const respPayload = await resp.json();

    expect(resp.status).toEqual(404);
    expect(respPayload).toEqual({
      status: 404,
      type: ErrorType.NOT_FOUND,
      title: 'Action not found',
      detail: `The ${method} action is not a valid Shlink SDK method`,
      method,
    });
    expect(getSession).toHaveBeenCalled();
    expect(getByPublicIdAndUser).toHaveBeenCalled();
    expect(createApiClient).toHaveBeenCalled();
  });

  it.each([
    ['getShortUrl', undefined],
    ['editTag', undefined],
    ['getShortUrl', []],
    ['editTag', []],
    ['editTag', ['just_one_arg']],
  ])('returns error if provided args are invalid', async (method, args) => {
    getSession.mockResolvedValue({ userId: '123' });
    getByPublicIdAndUser.mockResolvedValue({});
    const action = setUp();

    const resp = await action(fromPartial({
      request: fromPartial({ json: vi.fn().mockResolvedValue({ args }) }),
      params: { serverId: 'abc123', method },
    }));
    const respPayload = await resp.json();

    expect(resp.status).toEqual(400);
    expect(respPayload).toEqual({
      status: 400,
      type: 'https://shlink.io/api/error/invalid-arguments',
      title: 'Invalid arguments',
      detail: `Provided arguments are not valid for ${method} action`,
      args,
      method,
    });
    expect(getSession).toHaveBeenCalled();
    expect(getByPublicIdAndUser).toHaveBeenCalled();
    expect(createApiClient).toHaveBeenCalled();
  });

  it('returns error if invoking SDK fails', async () => {
    getSession.mockResolvedValue({ userId: '123' });
    getByPublicIdAndUser.mockResolvedValue({});
    const action = setUp();

    const resp = await action(fromPartial({
      request: fromPartial({ json: vi.fn().mockResolvedValue({ args: ['throw-error'] }) }),
      params: { serverId: 'abc123', method: 'getShortUrl' },
    }));
    const respPayload = await resp.json();

    expect(resp.status).toEqual(500);
    expect(respPayload).toEqual({
      status: 500,
      type: 'https://shlink.io/api/error/internal-server-error',
      title: 'Unexpected error',
      detail: 'An unexpected error occurred while calling Shlink API',
    });
    expect(getSession).toHaveBeenCalled();
    expect(getByPublicIdAndUser).toHaveBeenCalled();
    expect(createApiClient).toHaveBeenCalled();
  });

  it.each([
    ['getShortUrl', ['foo'], { shortCode: 'foo' }],
    ['editTag', ['foo', 'bar'], { oldTag: 'foo', newTag: 'bar' }],
  ])('returns result from calling corresponding SDK method', async (method, args, expectedResponse) => {
    getSession.mockResolvedValue({ userId: '123' });
    getByPublicIdAndUser.mockResolvedValue({});
    const action = setUp();

    const resp = await action(fromPartial({
      request: fromPartial({ json: vi.fn().mockResolvedValue({ args }) }),
      params: { serverId: 'abc123', method },
    }));
    const respPayload = await resp.json();

    expect(respPayload).toEqual(expectedResponse);
    expect(getSession).toHaveBeenCalled();
    expect(getByPublicIdAndUser).toHaveBeenCalled();
    expect(createApiClient).toHaveBeenCalled();
  });
});
