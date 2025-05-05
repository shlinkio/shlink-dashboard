import { fromPartial } from '@total-typescript/shoehorn';
import { expect } from 'vitest';
import type { User } from '../../../app/entities/User';
import { editProfileAction } from '../../../app/routes/profile/edit-profile-action.server';
import type { UsersService } from '../../../app/users/UsersService.server';

describe('edit-profile-action', () => {
  const editUser = vi.fn();
  const usersService: UsersService = fromPartial({ editUser });

  it('returns user from UsersService', async () => {
    const user = fromPartial<User>({});
    editUser.mockResolvedValue(user);

    const result = await editProfileAction('abc123', new FormData(), usersService);

    expect(result).toEqual({ ok: true, user });
  });
});
