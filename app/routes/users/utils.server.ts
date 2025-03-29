import type { AuthHelper } from '../../auth/auth-helper.server';
import { notFound } from '../../utils/response.server';

/**
 * Verifies current user is an admin, throwing a 404 response otherwise.
 */
export async function ensureAdmin(request: Request, authHelper: AuthHelper) {
  const { role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw notFound();
  }
}

/**
 * Verifies current user is not a managed user, throwing a 404 response otherwise.
 * @returns Current session in case.
 */
export async function ensureNotManaged(request: Request, authHelper: AuthHelper) {
  const session = await authHelper.getSession(request, '/login');
  if (session.role === 'managed-user') {
    throw notFound();
  }

  return session;
}
