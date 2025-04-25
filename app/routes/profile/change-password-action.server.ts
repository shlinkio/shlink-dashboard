import type { UsersService } from '../../users/UsersService.server';
import { ValidationError } from '../../validation/ValidationError.server';

export async function changePasswordAction(userPublicId: string, formData: FormData, usersService: UsersService) {
  try {
    await usersService.editUserPassword(userPublicId, formData);
    return { ok: true };
  } catch (e: any) {
    if (e instanceof ValidationError) {
      return { of: false, error: e.name, invalidFields: Object.keys(e.invalidFields) };
    }

    return { of: false, error: e.name };
  }
}
