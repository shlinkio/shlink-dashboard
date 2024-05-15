import type { Strategy } from 'remix-auth';
import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import type { UsersService } from '../users/UsersService.server';
import type { SessionData, SessionStorage } from './session.server';

export const CREDENTIALS_STRATEGY = 'credentials';

function getAuthStrategies(usersService: UsersService): Map<string, Strategy<any, any>> {
  const strategies = new Map<string, Strategy<any, any>>();

  // Add strategy to login via credentials form
  strategies.set(CREDENTIALS_STRATEGY, new FormStrategy(async ({ form }): Promise<SessionData> => {
    const username = form.get('username');
    const password = form.get('password');
    if (typeof username !== 'string' || typeof password !== 'string') {
      throw new Error('Username or password missing');
    }

    const user = await usersService.getUserByCredentials(username, password);
    return { userId: user.id };
  }));

  // TODO Add other strategies, like oAuth for SSO

  return strategies;
}

export function createAuthenticator(usersService: UsersService, sessionStorage: SessionStorage): Authenticator {
  const authenticator = new Authenticator(sessionStorage);
  const strategies = getAuthStrategies(usersService);
  strategies.forEach((strategy, name) => authenticator.use(strategy, name));

  return authenticator;
}
