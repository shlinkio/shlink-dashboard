import { fromPartial } from '@total-typescript/shoehorn';
import { action } from '../../../app/routes/users/create-user';
import type { UsersService } from '../../../app/users/UsersService.server';
import { DuplicatedEntryError } from '../../../app/validation/DuplicatedEntryError.server';
import { ValidationError } from '../../../app/validation/ValidationError.server';

describe('create-user', () => {
  describe('action', () => {
    const createUser = vi.fn();
    const usersService: UsersService = fromPartial({ createUser });
    const runAction = () => {
      const request = fromPartial<Request>({ formData: vi.fn().mockResolvedValue(new FormData()) });
      return action(fromPartial({ request }), usersService);
    };

    it('returns success when creating user works', async () => {
      const expectedUser = fromPartial({});
      const expectedPassword = 'the_password';
      createUser.mockResolvedValue([expectedUser, expectedPassword]);

      const result = await runAction();

      expect(result).toEqual({
        status: 'success',
        user: expectedUser,
        plainTextPassword: expectedPassword,
      });
    });

    it.each([
      {
        error: new DuplicatedEntryError('username'),
        expectedMessages: {
          username: 'Username is already in use.',
        },
      },
      {
        error: new ValidationError({ username: 'an error' }),
        expectedMessages: {
          username: 'Username can only contain letters and numbers. Underscore (_) and dot (.) can also be used anywhere except at the beginning or end.',
        },
      },
      {
        error: new ValidationError({}),
        expectedMessages: {},
      },
      {
        error: new Error(''),
        expectedMessages: {},
      },
    ])('returns expected messages on error', async ({ error, expectedMessages }) => {
      createUser.mockRejectedValue(error);
      const result = await runAction();

      expect(result).toEqual({
        status: 'error',
        messages: expectedMessages,
      });
    });
  });
});
