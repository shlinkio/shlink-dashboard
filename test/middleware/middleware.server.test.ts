import { fromPartial } from '@total-typescript/shoehorn';
import type { unstable_RouterContextProvider } from 'react-router';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import type { SessionData } from '../../app/auth/session-context';
import type { Role } from '../../app/entities/User';
import {
  authMiddleware,
  ensureAdminMiddleware,
  ensureNotManagedMiddleware,
} from '../../app/middleware/middleware.server';

describe('middleware', () => {
  const next = vi.fn().mockResolvedValue(new Response('Success', { status: 200 }));
  const set = vi.fn();
  const createContext = (role?: Role) => fromPartial<unstable_RouterContextProvider>({
    get: vi.fn().mockReturnValue({ role }),
    set,
  });

  describe('authMiddleware', () => {
    const request: Request = fromPartial({});
    const getSession = vi.fn();
    const authHelper: AuthHelper = fromPartial({ getSession });

    it('sets session in context', async () => {
      const session = fromPartial<SessionData>({ role: 'admin', userId: '123' });
      getSession.mockResolvedValue(session);

      await authMiddleware(fromPartial({ request, context: createContext() }), next, authHelper);

      expect(getSession).toHaveBeenCalledWith(request, '/login');
      expect(set).toHaveBeenCalledWith(expect.anything(), session);
    });
  });

  describe('ensureNotManagedMiddleware', () => {
    it.each([
      'admin' as const,
      'advanced-user' as const,
    ])('calls next when a non-managed user is logged-in', async (role) => {
      await ensureNotManagedMiddleware(fromPartial({ context: createContext(role) }), next);
      expect(next).toHaveBeenCalled();
    });

    it('throws when a managed user is logged-in', async () => {
      await expect(ensureNotManagedMiddleware(
        fromPartial({ context: createContext('managed-user') }),
        next,
      )).rejects.toThrow(expect.objectContaining({ status: 404 }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('ensureAdminMiddleware', () => {
    it('calls next when a admin user is logged-in', async () => {
      await ensureAdminMiddleware(fromPartial({ context: createContext('admin') }), next);
      expect(next).toHaveBeenCalled();
    });

    it.each([
      'managed-user' as const,
      'advanced-user' as const,
    ])('throws when a non-admin user is logged-in', async (role) => {
      await expect(ensureAdminMiddleware(
        fromPartial({ context: createContext(role) }),
        next,
      )).rejects.toThrow(expect.objectContaining({ status: 404 }));
      expect(next).not.toHaveBeenCalled();
    });
  });
});
