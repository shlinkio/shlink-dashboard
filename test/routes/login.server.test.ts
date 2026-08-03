import { fromPartial } from '@total-typescript/shoehorn';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import { action, loader } from '../../app/routes/login';

describe('login', () => {
  const login = vi.fn().mockResolvedValue(fromPartial({}));
  const isAuthenticated = vi.fn().mockResolvedValue(undefined);
  const authHelper = fromPartial<AuthHelper>({ login, isAuthenticated });

  describe('action', () => {
    it('authenticates user', () => {
      const request = fromPartial<Request>({});
      const url = new URL('https://example.com');

      action(fromPartial({ request, url }), authHelper);

      expect(login).toHaveBeenCalledWith(request, url);
    });

    it.each([{ message: 'Incorrect password' }, { message: 'User not found' }])(
      'returns json response when credentials are incorrect',
      async ({ message }) => {
        login.mockRejectedValue(new Error(message));

        const request = fromPartial<Request>({});
        const url = new URL('https://example.com');
        const response = await action(fromPartial({ request, url }), authHelper);

        expect(response).toEqual({ error: true });
      },
    );

    it('re-throws unknown errors', async () => {
      const e = new Error('Unknown error');
      const request = fromPartial<Request>({});

      login.mockRejectedValue(e);

      await expect(() => action(fromPartial({ request }), authHelper)).rejects.toEqual(e);
    });
  });

  describe('loader', () => {
    it('redirects if user is authenticated', async () => {
      isAuthenticated.mockResolvedValue(true);

      const request = fromPartial<Request>({});
      const response = await loader(fromPartial({ request }), authHelper);

      expect(response).instanceof(Response);
    });

    it('returns empty if user is not authenticated', async () => {
      isAuthenticated.mockResolvedValue(false);

      const request = fromPartial<Request>({});
      const response = await loader(fromPartial({ request }), authHelper);

      expect(response).toEqual({});
    });
  });
});
