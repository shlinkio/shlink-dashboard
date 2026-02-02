import { fromPartial } from '@total-typescript/shoehorn';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import { action, loader } from '../../app/routes/login';

describe('login', () => {
  const login = vi.fn().mockResolvedValue(fromPartial({}));
  const isAuthenticated = vi.fn().mockResolvedValue(undefined);
  const authHelper = fromPartial<AuthHelper>({ login, isAuthenticated });

  const createMockRequest = (formData: FormData = new FormData()) => {
    const request = fromPartial<Request>({
      clone: () => fromPartial<Request>({
        formData: () => Promise.resolve(formData),
      }),
    });
    return request;
  };

  describe('action', () => {
    it('authenticates user with local auth', async () => {
      const formData = new FormData();
      formData.set('username', 'testuser');
      formData.set('password', 'testpass');
      const request = createMockRequest(formData);

      await action(fromPartial({ request }), authHelper);

      expect(login).toHaveBeenCalledWith(request);
    });

    it.each([
      { message: 'Incorrect password' },
      { message: 'User not found' },
    ])('returns json response when credentials are incorrect', async ({ message }) => {
      login.mockRejectedValue(new Error(message));

      const formData = new FormData();
      const request = createMockRequest(formData);
      const response = await action(fromPartial({ request }), authHelper);

      expect(response).toEqual({ error: true });
    });

    it('re-throws unknown errors', async () => {
      const e = new Error('Unknown error');
      const formData = new FormData();
      const request = createMockRequest(formData);

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

    it('returns auth config if user is not authenticated', async () => {
      isAuthenticated.mockResolvedValue(false);

      const request = fromPartial<Request>({});
      const response = await loader(fromPartial({ request }), authHelper);

      // When OIDC is not enabled, returns local auth enabled status
      expect(response).toEqual({ oidcEnabled: false, localAuthEnabled: true, oidcProviderName: 'SSO' });
    });
  });
});
