import type { SessionStorage } from '@remix-run/node';
import { redirect } from 'react-router';
import type { Authenticator } from 'remix-auth';
import { CREDENTIALS_STRATEGY } from './auth.server';
import type { SessionData } from './session-context';

/**
 * Wraps a SessionStorage and Authenticator to perform common authentication and session checking/commiting/destroying
 * operations
 */
export class AuthHelper {
  constructor(
    private readonly authenticator: Authenticator<SessionData>,
    private readonly sessionStorage: SessionStorage<{ sessionData: SessionData }>,
  ) {}

  async login(request: Request): Promise<Response> {
    const [sessionData, session] = await Promise.all([
      this.authenticator.authenticate(CREDENTIALS_STRATEGY, request),
      this.sessionStorage.getSession(request.headers.get('cookie')),
    ]);
    session.set('sessionData', sessionData);

    const redirectTo = new URL(request.url).searchParams.get('redirect-to');
    const successRedirect = redirectTo && !redirectTo.toLowerCase().startsWith('http') ? redirectTo : '/';

    return redirect(successRedirect, {
      headers: { 'Set-Cookie': await this.sessionStorage.commitSession(session) },
    });
  }

  async logout(request: Request): Promise<Response> {
    const session = await this.sessionStorage.getSession(request.headers.get('cookie'));
    return redirect('/login', {
      headers: { 'Set-Cookie': await this.sessionStorage.destroySession(session) },
    });
  }

  async getSession(request: Request): Promise<SessionData | undefined>;
  async getSession(request: Request, redirectTo: string): Promise<SessionData>;
  async getSession(request: Request, redirectTo?: string): Promise<SessionData | undefined> {
    const session = await this.sessionStorage.getSession(request.headers.get('cookie'));
    const sessionData = session.get('sessionData');

    if (redirectTo && !sessionData) {
      throw redirect(redirectTo);
    }

    return sessionData;
  }

  async isAuthenticated(request: Request): Promise<boolean> {
    const sessionData = await this.getSession(request);
    return !!sessionData;
  }
}
