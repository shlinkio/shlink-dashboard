import { fromPartial } from '@total-typescript/shoehorn';
import type { EntityManager } from 'typeorm';
import { hashPassword } from '../../app/auth/passwords.server';
import type { User } from '../../app/entities/User';
import { UsersService } from '../../app/users/UsersService.server';

describe('UsersService', () => {
  const findOneBy = vi.fn();
  let em: EntityManager;
  let usersService: UsersService;

  beforeEach(() => {
    em = fromPartial<EntityManager>({ findOneBy });
    usersService = new UsersService(em);
  });

  describe('getUserByCredentials', () => {
    it('throws when user is not found', async () => {
      findOneBy.mockResolvedValue(null);
      await expect(() => usersService.getUserByCredentials('foo', 'bar')).rejects.toEqual(
        new Error('User not found with username foo'),
      );
    });

    it('throws if password does not match', async () => {
      findOneBy.mockResolvedValue(fromPartial<User>({ password: await hashPassword('the right one') }));
      await expect(() => usersService.getUserByCredentials('foo', 'bar')).rejects.toEqual(
        new Error('Incorrect password for user foo'),
      );
    });

    it('returns user if password is correct', async () => {
      const expectedUser = fromPartial<User>({ password: await hashPassword('bar') });
      findOneBy.mockResolvedValue(expectedUser);

      const result = await usersService.getUserByCredentials('foo', 'bar');

      expect(result).toEqual(expectedUser);
    });
  });
});
