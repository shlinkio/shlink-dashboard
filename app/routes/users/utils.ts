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
