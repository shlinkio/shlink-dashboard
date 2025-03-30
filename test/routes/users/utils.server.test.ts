import { fromPartial } from '@total-typescript/shoehorn';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import type { SessionData } from '../../../app/auth/session-context';
import { ensureNotManaged } from '../../../app/routes/users/utils.server';

describe('utils', () => {
  describe('ensureNotManaged', () => {
    const request: Request = fromPartial({});
    const getSession = vi.fn();
    const authHelper: AuthHelper = fromPartial({ getSession });

    it.each([
      fromPartial<SessionData>({ role: 'admin', userId: '123' }),
      fromPartial<SessionData>({ role: 'advanced-user', userId: '123' }),
    ])('returns session when a non-managed user is logged-in', async (session) => {
      getSession.mockResolvedValue(session);

      const result = await ensureNotManaged(request, authHelper);

      expect(result).toEqual(session);
      expect(getSession).toHaveBeenCalledWith(request, '/login');
    });

    it('throws when a managed user is logged-in', async () => {
      getSession.mockResolvedValue(fromPartial<SessionData>({ role: 'managed-user', userId: '123' }));

      await expect(ensureNotManaged(request, authHelper)).rejects.toThrow(expect.objectContaining({
        status: 404,
      }));
      expect(getSession).toHaveBeenCalledWith(request, '/login');
    });
  });
});
