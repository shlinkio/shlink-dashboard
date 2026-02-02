import type { Session, SessionStorage } from 'react-router';
import { redirect } from 'react-router';
import type { Authenticator } from 'remix-auth';
import type { User } from '../entities/User';
import { requestQueryParam } from '../utils/request.server';
import { CREDENTIALS_STRATEGY } from './auth.server';
import type { SessionData, ShlinkSessionData } from './session-context';

/**
 * Validate redirect URL to prevent open redirect attacks.
 * Only allows relative paths starting with / and not containing protocol handlers.
 */
function isValidRedirectUrl(url: string | undefined): url is string {
  if (!url) {
    return false;
  }

  // Must start with a single forward slash (not //)
  if (!url.startsWith('/') || url.startsWith('//')) {
    return false;
  }

  // Must not contain protocol handlers
  if (url.includes(':')) {
    return false;
  }

  // Must not contain backslashes (path traversal)
  if (url.includes('\\')) {
    return false;
  }

  return true;
}

function getSafeRedirectUrl(url: string | undefined): string {
  return isValidRedirectUrl(url) ? url : '/';
}

/**
 * Wraps a SessionStorage and Authenticator to perform common authentication and session checking/commiting/destroying
 * operations
 */
export class AuthHelper {
  readonly #authenticator: Authenticator<SessionData>;
  readonly #sessionStorage: SessionStorage<ShlinkSessionData>;

  constructor(authenticator: Authenticator<SessionData>, sessionStorage: SessionStorage<ShlinkSessionData>) {
    this.#authenticator = authenticator;
    this.#sessionStorage = sessionStorage;
  }

  async login(request: Request): Promise<Response> {
    const [sessionData, session] = await Promise.all([
      this.#authenticator.authenticate(CREDENTIALS_STRATEGY, request),
      this.sessionFromRequest(request),
    ]);
    session.set('sessionData', sessionData);

    const redirectTo = requestQueryParam(request, 'redirect-to');
    const successRedirect = getSafeRedirectUrl(redirectTo);

    return redirect(successRedirect, {
      headers: { 'Set-Cookie': await this.#sessionStorage.commitSession(session) },
    });
  }

  /**
   * Create a session for a user authenticated via OIDC
   */
  async loginWithOidc(request: Request, user: User, redirectTo?: string): Promise<Response> {
    const session = await this.sessionFromRequest(request);
    const sessionData: SessionData = {
      publicId: user.publicId,
      displayName: user.displayName,
      username: user.username,
      role: user.role,
      tempPassword: false, // OIDC users never have temp passwords
    };
    session.set('sessionData', sessionData);

    const successRedirect = getSafeRedirectUrl(redirectTo);

    return redirect(successRedirect, {
      headers: { 'Set-Cookie': await this.#sessionStorage.commitSession(session) },
    });
  }

  async logout(request: Request): Promise<Response> {
    const session = await this.sessionFromRequest(request);
    return redirect('/login', {
      headers: { 'Set-Cookie': await this.#sessionStorage.destroySession(session) },
    });
  }

  async getSession(request: Request): Promise<SessionData | undefined>;
  async getSession(request: Request, onMissingSessionRedirectTo: string): Promise<SessionData>;
  async getSession(request: Request, onMissingSessionRedirectTo?: string): Promise<SessionData | undefined> {
    const [sessionData] = await this.sessionAndData(request);
    if (onMissingSessionRedirectTo && !sessionData) {
      throw redirect(onMissingSessionRedirectTo);
    }

    // Redirect logged-in users with a temp password to the change-password form, unless that's already the active route
    if (sessionData?.tempPassword && new URL(request.url).pathname !== '/change-password') {
      throw redirect('/change-password');
    }

    return sessionData;
  }

  /**
   * Refresh an active session expiration, to avoid expiring cookies for users which are active in the app
   * @todo Return a response with the cookie already set, as login and logout methods do
   */
  async refreshSessionExpiration(request: Request): Promise<string | undefined> {
    return this.updateSession(request, {});
  }

  /**
   * Update and commit current session, if any, with the changed information
   * @todo Return a response with the cookie already set, as login and logout methods do
   */
  async updateSession(request: Request, newSessionData: Partial<SessionData>): Promise<string | undefined> {
    const [sessionData, session] = await this.sessionAndData(request);
    if (sessionData) {
      session.set('sessionData', { ...sessionData, ...newSessionData });
      return await this.#sessionStorage.commitSession(session);
    }

    return undefined;
  }

  private sessionFromRequest(request: Request): Promise<Session<ShlinkSessionData>> {
    return this.#sessionStorage.getSession(request.headers.get('cookie'));
  }

  private async sessionAndData(request: Request): Promise<[SessionData | undefined, Session<ShlinkSessionData>]> {
    const session = await this.sessionFromRequest(request);
    return [session.get('sessionData'), session];
  }

  async isAuthenticated(request: Request): Promise<boolean> {
    const sessionData = await this.getSession(request);
    return !!sessionData;
  }
}
