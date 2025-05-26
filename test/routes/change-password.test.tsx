import { fromPartial } from '@total-typescript/shoehorn';
import type { AuthHelper } from '../../app/auth/auth-helper.server';
import { action, loader } from '../../app/routes/change-password';
import { INVALID_PASSWORD_FORMAT } from '../../app/routes/profile/change-password-action.server';
import { PasswordMismatchError } from '../../app/users/PasswordMismatchError.server';
import type { UsersService } from '../../app/users/UsersService.server';
import { ValidationError } from '../../app/validation/ValidationError.server';

describe('change-password', () => {
  describe('loader', () => {
    const runLoader = async ({ tempPassword }: { tempPassword: boolean }) => loader(fromPartial({
      context: { get: () => ({ tempPassword }) },
    }));

    it('redirects to home if current user password is not temporary', async () => {
      const response = await runLoader({ tempPassword: false });

      expect(response?.status).toEqual(302);
      expect(response?.headers.get('Location')).toEqual('/');
    });

    it('returns undefined if current user password is temporary', async () => {
      const response = await runLoader({ tempPassword: true });
      expect(response).toBeUndefined();
    });
  });

  describe('action', () => {
    const editUserTempPassword = vi.fn();
    const usersService: UsersService = fromPartial({ editUserTempPassword });
    const updateSession = vi.fn();
    const authHelper: AuthHelper = fromPartial({ updateSession });

    const runAction = () => action(
      fromPartial({
        context: { get: () => ({ publicId: 'abc123' }) },
        request: { formData: vi.fn().mockResolvedValue(new FormData()) },
      }),
      usersService,
      authHelper,
    );

    it.each([
      {
        error: new ValidationError({}),
        expectedResult: { ok: false, error: INVALID_PASSWORD_FORMAT },
      },
      {
        error: new PasswordMismatchError(),
        expectedResult: { ok: false, error: 'Passwords do not match' },
      },
    ])('gracefully handles known errors', async ({ error, expectedResult }) => {
      editUserTempPassword.mockRejectedValue(error);

      const result = await runAction();

      expect(result).toEqual(expectedResult);
      expect(editUserTempPassword).toHaveBeenCalledOnce();
      expect(updateSession).not.toHaveBeenCalled();
    });

    it('re-throws unknown errors', async () => {
      const unknownError = new Error('Something went wrong');
      editUserTempPassword.mockRejectedValue(unknownError);

      await expect(runAction()).rejects.toThrow(unknownError);
    });

    it.each([
      undefined,
      '',
      'session cookie',
    ])('updates session when passwords are correct', async (sessionCookie) => {
      editUserTempPassword.mockResolvedValue(undefined);
      updateSession.mockResolvedValue(sessionCookie);

      const result = await runAction();

      // Just making TypeScript happy
      if (!('data' in result)) {
        throw new Error('Result is not a response');
      }

      expect(result.data.ok).toEqual(true);
      expect(result.init?.headers).toEqual(sessionCookie ? { 'Set-Cookie': sessionCookie } : undefined);
      expect(editUserTempPassword).toHaveBeenCalledOnce();
      expect(updateSession).toHaveBeenCalledOnce();
    });
  });

  describe.todo('<ChangePassword />');
});
