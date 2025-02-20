import { Authenticator } from 'remix-auth';
import type { Strategy } from 'remix-auth/strategy';
import { FormStrategy } from 'remix-auth-form';
import type { UsersService } from '../users/UsersService.server';
import { credentialsSchema } from './credentials-schema.server';
import type { SessionData } from './session-context';

export const CREDENTIALS_STRATEGY = 'credentials';

function getAuthStrategies(usersService: UsersService): Map<string, Strategy<SessionData, any>> {
  const strategies = new Map<string, Strategy<SessionData, any>>();

  // Add strategy to login via credentials form
  strategies.set(CREDENTIALS_STRATEGY, new FormStrategy(async ({ form }): Promise<SessionData> => {
    const { username, password } = credentialsSchema.parse({
      username: form.get('username'),
      password: form.get('password'),
    });

    const { id, displayName, role } = await usersService.getUserByCredentials(username, password);
    return { userId: id.toString(), displayName, role };
  }));

  // TODO Add other strategies, like oAuth for SSO

  return strategies;
}

export function createAuthenticator(usersService: UsersService): Authenticator<SessionData> {
  const authenticator = new Authenticator<SessionData>();
  const strategies = getAuthStrategies(usersService);
  strategies.forEach((strategy, name) => authenticator.use(strategy, name));

  return authenticator;
}
