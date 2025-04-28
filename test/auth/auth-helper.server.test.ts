import { fromPartial } from '@total-typescript/shoehorn';
import type { SessionStorage } from 'react-router';
import type { Authenticator } from 'remix-auth';
import { AuthHelper } from '../../app/auth/auth-helper.server';
import type { SessionData, ShlinkSessionData } from '../../app/auth/session-context';

describe('AuthHelper', () => {
  const authenticate = vi.fn();
  const authenticator: Authenticator<SessionData> = fromPartial({ authenticate });

  const defaultSessionData = fromPartial<ShlinkSessionData>({
    sessionData: { displayName: 'foo' },
  });
  const getSessionData = vi.fn().mockReturnValue(defaultSessionData);
  const setSessionData = vi.fn();
  const getSession = vi.fn().mockResolvedValue({ get: getSessionData, set: setSessionData });
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

  describe('refreshSessionExpiration', () => {
    it('sets no cookie when there is no session', async () => {
      const authHelper = setUp();
      const request = buildRequest();

      getSessionData.mockReturnValue(undefined);

      const cookie = await authHelper.refreshSessionExpiration(request);

      expect(cookie).toBeUndefined();
      expect(commitSession).not.toHaveBeenCalled();
    });

    it('sets cookie and commits session when it is not expired', async () => {
      const authHelper = setUp();
      const request = buildRequest();

      getSessionData.mockReturnValue(defaultSessionData);
      commitSession.mockResolvedValue('the-cookie-value');

      const cookie = await authHelper.refreshSessionExpiration(request);

      expect(cookie).toEqual('the-cookie-value');
      expect(commitSession).toHaveBeenCalled();
    });
  });

  describe('updateSession', () => {
    it('commits session with new data', async () => {
      const authHelper = setUp();
      const request = buildRequest();
      const newSession: Partial<SessionData> = { username: 'updated', role: 'advanced-user' };

      getSessionData.mockReturnValue(defaultSessionData.sessionData);

      await authHelper.updateSession(request, newSession);

      expect(setSessionData).toHaveBeenCalledWith('sessionData', { ...defaultSessionData.sessionData, ...newSession });
    });
  });
});
