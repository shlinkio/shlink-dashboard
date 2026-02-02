import { fromPartial } from '@total-typescript/shoehorn';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
import type { User } from '../../../app/entities/User';
import { action, loader } from '../../../app/routes/users/edit-user';
import type { UsersService } from '../../../app/users/UsersService.server';
import { NotFoundError } from '../../../app/validation/NotFoundError.server';

describe('edit-user', () => {
  const getUserById = vi.fn();
  const editUser = vi.fn();
  const usersService: UsersService = fromPartial({ getUserById, editUser });
  const request: Request = fromPartial({ formData: vi.fn().mockResolvedValue(new FormData()) });

  describe('loader', () => {
    const runLoader = (params: LoaderFunctionArgs['params']) => loader(fromPartial({ params, request }), usersService);

    it('returns 404 when NotFoundError occurs', async () => {
      getUserById.mockRejectedValue(new NotFoundError(''));
      await expect(runLoader({ userPublicId: '123' })).rejects.toThrow(expect.objectContaining({ status: 404 }));
    });

    it('throws unknown errors verbatim', async () => {
      const unknownError = new Error('Something went wrong');
      getUserById.mockRejectedValue(unknownError);

      await expect(runLoader({ userPublicId: '123' })).rejects.toThrow(unknownError);
    });

    it.each([{ userPublicId: '123' }, { userPublicId: 'abc' }])('returns user by id', async ({ userPublicId }) => {
      const user: User = fromPartial({ id: 'abc123' });
      getUserById.mockResolvedValue(user);

      const result = await runLoader({ userPublicId });

      expect(result).toEqual({ user });
      expect(getUserById).toHaveBeenCalledWith(userPublicId);
    });
  });

  describe('action', () => {
    const runAction = (params: ActionFunctionArgs['params']) => action(fromPartial({ params, request }), usersService);

    it.each([
      { userPublicId: '123' },
      { userPublicId: 'abc' },
    ])('edits user and redirects to list', async ({ userPublicId }) => {
      editUser.mockResolvedValue(fromPartial({ id: 'abc123' }));

      const response = await runAction({ userPublicId });

      expect(response.status).toEqual(302);
      expect(response.headers.get('Location')).toEqual('/manage-users/1');
      expect(editUser).toHaveBeenCalledWith(userPublicId, new FormData());
    });
  });
});
