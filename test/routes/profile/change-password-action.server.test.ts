import { fromPartial } from '@total-typescript/shoehorn';
import {
  changePasswordAction,
  INVALID_PASSWORD_FORMAT,
} from '../../../app/routes/profile/change-password-action.server';
import { IncorrectPasswordError } from '../../../app/users/IncorrectPasswordError.server';
import { PasswordMismatchError } from '../../../app/users/PasswordMismatchError.server';
import type { UsersService } from '../../../app/users/UsersService.server';
import { ValidationError } from '../../../app/validation/ValidationError.server';

describe('change-password-action', () => {
  const editUserPassword = vi.fn();
  const usersService: UsersService = fromPartial({ editUserPassword });
  const formData = new FormData();

  it('returns `ok` if everything worked', async () => {
    const result = await changePasswordAction('abc123', formData, usersService);

    expect(result).toEqual({ ok: true });
    expect(editUserPassword).toHaveBeenCalledWith('abc123', formData);
  });

  it('returns invalid passwords error when validation error occurs', async () => {
    editUserPassword.mockRejectedValue(new ValidationError({
      foo: 'foo',
      bar: 'bar',
    }));

    const { ok, invalidFields } = await changePasswordAction('abc123', formData, usersService);

    expect(ok).toBe(false);
    expect(invalidFields).toEqual({
      foo: INVALID_PASSWORD_FORMAT,
      bar: INVALID_PASSWORD_FORMAT,
    });
  });

  it('returns invalid current password if IncorrectPasswordError is thrown', async () => {
    const e = new IncorrectPasswordError();
    editUserPassword.mockRejectedValue(e);

    const { ok, invalidFields } = await changePasswordAction('abc123', formData, usersService);

    expect(ok).toBe(false);
    expect(invalidFields).toEqual({ currentPassword: e.message });
  });

  it('returns invalid new passwords if PasswordMismatchError is thrown', async () => {
    const e = new PasswordMismatchError();
    editUserPassword.mockRejectedValue(e);

    const { ok, invalidFields } = await changePasswordAction('abc123', formData, usersService);

    expect(ok).toBe(false);
    expect(invalidFields).toEqual({
      newPassword: e.message,
      repeatPassword: e.message,
    });
  });

  it('re-throws any unknown error', async () => {
    const e = new Error('Unknown');
    editUserPassword.mockRejectedValue(e);

    await expect(changePasswordAction('abc123', formData, usersService)).rejects.toThrow(e);
  });
});
