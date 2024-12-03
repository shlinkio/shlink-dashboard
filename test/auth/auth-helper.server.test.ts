import type { SessionStorage } from '@remix-run/node';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Authenticator } from 'remix-auth';
import { AuthHelper } from '../../app/auth/auth-helper.server';
import type { SessionData } from '../../app/auth/session-context';

describe('AuthHelper', () => {
  const authenticate = vi.fn();
  const authenticator: Authenticator<SessionData> = fromPartial({ authenticate });

  const defaultSessionData = fromPartial<SessionData>({ displayName: 'foo' });
  const getSessionData = vi.fn().mockReturnValue(defaultSessionData);
  const getSession = vi.fn().mockResolvedValue({ get: getSessionData, set: vi.fn() });
  const commitSession = vi.fn();
  const destroySession = vi.fn();
  const sessionStorage: SessionStorage = fromPartial({ getSession, commitSession, destroySession });

  const setUp = () => new AuthHelper(authenticator, sessionStorage);
  const buildRequest = (url?: string) => fromPartial<Request>({ url, headers: new Headers() });

  describe('login', () => {
    it.each([
      ['http://example.com', '/'],
      [`http://example.com?redirect-to=${encodeURIComponent('/foo/bar')}`, '/foo/bar'],
      [`http://example.com?redirect-to=${encodeURIComponent('https://example.com')}`, '/'],
    ])('authenticates user and redirects to expected location', async (url, expectedRedirect) => {
      const authHelper = setUp();
      const request = buildRequest(url);

      const response = await authHelper.login(request);

      expect(response.headers.get('Location')).toEqual(expectedRedirect);
      expect(authenticate).toHaveBeenCalled();
      expect(getSession).toHaveBeenCalled();
      expect(commitSession).toHaveBeenCalled();
      expect(destroySession).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('destroys session and redirects to login page', async () => {
      const authHelper = setUp();
      const request = buildRequest();

      const response = await authHelper.logout(request);

      expect(response.headers.get('Location')).toEqual('/login');
      expect(getSession).toHaveBeenCalled();
      expect(destroySession).toHaveBeenCalled();
      expect(commitSession).not.toHaveBeenCalled();
      expect(authenticate).not.toHaveBeenCalled();
    });
  });

  describe('getSession', () => {
    it.each([
      [defaultSessionData],
      [undefined],
    ])('returns session data when no redirect is provided', async (returnedSessionData) => {
      const authHelper = setUp();
      const request = buildRequest();

      getSessionData.mockReturnValue(returnedSessionData);
      const sessionData = await authHelper.getSession(request);

      expect(sessionData).toEqual(returnedSessionData);
    });

    it('throws redirect to provided URL if session is not found', async () => {
      const authHelper = setUp();
      const request = buildRequest();

      getSessionData.mockReturnValue(undefined);

      await expect(() => authHelper.getSession(request, '/redirect-here')).rejects.toThrow();
      expect(getSession).toHaveBeenCalled();
      expect(destroySession).not.toHaveBeenCalled();
      expect(commitSession).not.toHaveBeenCalled();
      expect(authenticate).not.toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it.each([
      [defaultSessionData],
      [undefined],
    ])('checks if a session exists', async (returnedSessionData) => {
      const authHelper = setUp();
      const request = buildRequest();

      getSessionData.mockReturnValue(returnedSessionData);
      const result = await authHelper.isAuthenticated(request);

      expect(result).toEqual(!!returnedSessionData);
      expect(getSession).toHaveBeenCalled();
      expect(destroySession).not.toHaveBeenCalled();
      expect(commitSession).not.toHaveBeenCalled();
      expect(authenticate).not.toHaveBeenCalled();
    });
  });
});
