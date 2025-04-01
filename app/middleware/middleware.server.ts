import type { unstable_MiddlewareFunction as MiddlewareFunction } from 'react-router';
import { unstable_createContext as createContext } from 'react-router';
import { AuthHelper } from '../auth/auth-helper.server';
import type { SessionData } from '../auth/session-context';
import { serverContainer } from '../container/container.server';
import { notFound } from '../utils/response.server';

/**
 * Context set in authMiddleware, which includes the session data of the logged-in user, to use in subsequent
 * middlewares, loaders and actions
 */
export const sessionContext = createContext<SessionData>();

/**
 * Verifies a user is logged in, and redirects to login page otherwise
 * @todo Redirect to login with a redirect-to param to return to original location
 */
export const authMiddleware = async function (
  { request, context },
  next,
  authHelper: AuthHelper = serverContainer[AuthHelper.name],
) {
  const sessionData = await authHelper.getSession(request, '/login');
  context.set(sessionContext, sessionData);

  return next();
} satisfies MiddlewareFunction;

/**
 * Verifies logged-in user is not a managed-user, returning a 404 response if so
 */
export const ensureNotManagedMiddleware: MiddlewareFunction = async function ({ context }, next) {
  const sessionData = context.get(sessionContext);
  if (sessionData.role === 'managed-user') {
    throw notFound();
  }

  return next();
};

/**
 * Verifies logged-in user is an admin, returning a 404 response otherwise
 */
export const ensureAdminMiddleware: MiddlewareFunction = async function ({ context }, next) {
  const sessionData = context.get(sessionContext);
  if (sessionData.role !== 'admin') {
    throw notFound();
  }

  return next();
};
