import type { AuthHelper } from '../../auth/auth-helper.server';

/**
 * Verifies current user is an admin, throwing a 404 response otherwise.
 */
export async function ensureAdmin(request: Request, authHelper: AuthHelper) {
  const { role } = await authHelper.getSession(request, '/login');
  if (role !== 'admin') {
    throw new Response('Not found', { status: 404 });
  }
}
