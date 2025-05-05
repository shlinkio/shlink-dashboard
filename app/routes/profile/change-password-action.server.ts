import { IncorrectPasswordError } from '../../users/IncorrectPasswordError.server';
import { PasswordMismatchError } from '../../users/PasswordMismatchError.server';
import type { UsersService } from '../../users/UsersService.server';
import { ValidationError } from '../../validation/ValidationError.server';

export const INVALID_PASSWORD_FORMAT = 'Passwords must be at least 8-characters long and include a lowercase, an uppercase, a number and a special character';

export type ChangePasswordResult =
  | { ok: true; invalidFields?: undefined }
  | { ok: false; invalidFields: Record<string, string> };

export async function changePasswordAction(
  userPublicId: string,
  formData: FormData,
  usersService: UsersService,
): Promise<ChangePasswordResult> {
  try {
    await usersService.editUserPassword(userPublicId, formData);
    return { ok: true };
  } catch (e) {
    if (e instanceof ValidationError) {
      return {
        ok: false,
        invalidFields: Object.keys(e.invalidFields).reduce<Record<string, string>>((acc, key) => {
          acc[key] = INVALID_PASSWORD_FORMAT;
          return acc;
        }, {}),
      };
    } else if (e instanceof IncorrectPasswordError) {
      return {
        ok: false,
        invalidFields: { currentPassword: e.message },
      };
    } else if (e instanceof PasswordMismatchError) {
      return {
        ok: false,
        invalidFields: {
          newPassword: e.message,
          repeatPassword: e.message,
        },
      };
    }

    throw e;
  }
}
