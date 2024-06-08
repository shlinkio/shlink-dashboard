import { fromPartial } from '@total-typescript/shoehorn';
import { ReadableStream } from 'node:stream/web';
import { Authenticator } from 'remix-auth';
import { createAuthenticator, CREDENTIALS_STRATEGY } from '../../app/auth/auth.server';
import type { UsersService } from '../../app/users/UsersService.server';

describe('auth', () => {
  const getUserByCredentials = vi.fn();
  const usersService = fromPartial<UsersService>({ getUserByCredentials });

  describe('createAuthenticator', () => {
    it('creates the authenticator instance', () => {
      const authenticator = createAuthenticator(usersService, fromPartial({}));
      expect(authenticator).toBeInstanceOf(Authenticator);
    });
  });

  describe('authenticator', () => {
    const authenticator = createAuthenticator(usersService, fromPartial({}));
    const requestWithBody = (body: string = '') => {
      const headers = new Headers();
      headers.set('Content-Type', 'application/x-www-form-urlencoded');
      return fromPartial<Request>({
        body: ReadableStream.from(body),
        url: 'https://example.com',
        headers,
        method: 'POST',
      });
    };

    it('throws error when credentials are invalid', async () => {
      const callback = () => authenticator.authenticate(
        CREDENTIALS_STRATEGY,
        requestWithBody(),
      );

      await expect(callback).rejects.toThrow();
      expect(getUserByCredentials).not.toHaveBeenCalled();
    });

    it('tries to find user with credentials', async () => {
      getUserByCredentials.mockResolvedValue({ id: '123' });

      const result = await authenticator.authenticate(
        CREDENTIALS_STRATEGY,
        requestWithBody('username=foo&password=bar'),
      );

      expect(result).toEqual({ userId: '123' });
      expect(getUserByCredentials).toHaveBeenCalledWith('foo', 'bar');
    });
  });
});
