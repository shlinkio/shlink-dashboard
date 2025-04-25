import type { UsersService } from '../../users/UsersService.server';

export async function editProfileActionServer(userPublicId: string, formData: FormData, usersService: UsersService) {
  // Ensure only the display name is taken into consideration, so that users cannot change their own role
  await usersService.editUser(userPublicId, formData, ['displayName']);
  return { ok: true };
}
