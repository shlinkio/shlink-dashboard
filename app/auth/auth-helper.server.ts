import type { Session, SessionStorage } from 'react-router';
import { redirect } from 'react-router';
import type { Authenticator } from 'remix-auth';
import { CREDENTIALS_STRATEGY } from './auth.server';
import type { SessionData, ShlinkSessionData } from './session-context';

/**
 * Wraps a SessionStorage and Authenticator to perform common authentication and session checking/commiting/destroying
 * operations
 */
export class AuthHelper {
  constructor(
    private readonly authenticator: Authenticator<SessionData>,
    private readonly sessionStorage: SessionStorage<ShlinkSessionData>,
  ) {}

  async login(request: Request): Promise<Response> {
    const [sessionData, session] = await Promise.all([
      this.authenticator.authenticate(CREDENTIALS_STRATEGY, request),
      this.sessionFromRequest(request),
    ]);
    session.set('sessionData', sessionData);

    const redirectTo = new URL(request.url).searchParams.get('redirect-to');
    const successRedirect = redirectTo && !redirectTo.toLowerCase().startsWith('http') ? redirectTo : '/';

    return redirect(successRedirect, {
      headers: { 'Set-Cookie': await this.sessionStorage.commitSession(session) },
    });
  }

  async logout(request: Request): Promise<Response> {
    const session = await this.sessionFromRequest(request);
    return redirect('/login', {
      headers: { 'Set-Cookie': await this.sessionStorage.destroySession(session) },
    });
  }

  async getSession(request: Request): Promise<SessionData | undefined>;
  async getSession(request: Request, redirectTo: string): Promise<SessionData>;
  async getSession(request: Request, redirectTo?: string): Promise<SessionData | undefined> {
    const [sessionData] = await this.sessionAndData(request);
    if (redirectTo && !sessionData) {
      throw redirect(redirectTo);
    }

    return sessionData;
  }

  /**
   * Refresh an active session expiration, to avoid expiring cookies for users which are active in the app
   */
  async refreshSessionExpiration(request: Request): Promise<string | undefined> {
    const [sessionData, session] = await this.sessionAndData(request);
    if (sessionData) {
      return await this.sessionStorage.commitSession(session);
    }

    return undefined;
  }

  private sessionFromRequest(request: Request): Promise<Session<ShlinkSessionData>> {
    return this.sessionStorage.getSession(request.headers.get('cookie'));
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
