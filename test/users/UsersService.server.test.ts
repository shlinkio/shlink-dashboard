import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { fromPartial } from '@total-typescript/shoehorn';
import { hashPassword, verifyPassword } from '../../app/auth/passwords.server';
import type { User } from '../../app/entities/User';
import type { UsersRepository } from '../../app/users/UsersRepository.server';
import { UsersService } from '../../app/users/UsersService.server';
import { DuplicatedEntryError } from '../../app/validation/DuplicatedEntryError.server';

describe('UsersService', () => {
  const findOneByUsername = vi.fn();
  const findAndCountUsers = vi.fn();
  const createUser = vi.fn();
  const deleteUser = vi.fn();
  let usersRepo: UsersRepository;
  let usersService: UsersService;

  beforeEach(() => {
    usersRepo = fromPartial<UsersRepository>({ findOneByUsername, findAndCountUsers, createUser, deleteUser });
    usersService = new UsersService(usersRepo);
  });

  describe('getUserByCredentials', () => {
    it('throws when user is not found', async () => {
      findOneByUsername.mockResolvedValue(null);
      await expect(() => usersService.getUserByCredentials('foo', 'bar')).rejects.toEqual(
        new Error('User not found with username foo'),
      );
    });

    it('throws if password does not match', async () => {
      findOneByUsername.mockResolvedValue(fromPartial<User>({ password: await hashPassword('the right one') }));
      await expect(() => usersService.getUserByCredentials('foo', 'bar')).rejects.toEqual(
        new Error('Incorrect password for user foo'),
      );
    });

    it('returns user if password is correct', async () => {
      const expectedUser = fromPartial<User>({ password: await hashPassword('bar') });
      findOneByUsername.mockResolvedValue(expectedUser);

      const result = await usersService.getUserByCredentials('foo', 'bar');

      expect(result).toEqual(expectedUser);
    });
  });

  describe('listUsers', () => {
    it.each([
      {
        page: 1,
        expectedOffset: 0,
        totalUsers: 10,
        expectedTotalPages: 1,
      },
      {
        page: 2,
        expectedOffset: 20,
        totalUsers: 20,
        expectedTotalPages: 1,
      },
      {
        expectedOffset: 0,
        totalUsers: 21,
        expectedTotalPages: 2,
      },
      {
        page: 10,
        expectedOffset: 180,
        totalUsers: 100,
        expectedTotalPages: 5,
      },
      {
        expectedOffset: 0,
        totalUsers: 103,
        expectedTotalPages: 6,
      },
      {
        expectedOffset: 0,
        totalUsers: 119,
        expectedTotalPages: 6,
      },
    ])('returns users list and totals', async ({ totalUsers, page, expectedOffset, expectedTotalPages }) => {
      const users: User[] = [
        fromPartial({}),
        fromPartial({}),
        fromPartial({}),
      ];
      findAndCountUsers.mockResolvedValue([users, totalUsers]);

      const result = await usersService.listUsers({ page });

      expect(findAndCountUsers).toHaveBeenCalledWith(expect.objectContaining({
        offset: expectedOffset,
      }));
      expect(result.users).toEqual(users);
      expect(result.totalUsers).toEqual(totalUsers);
      expect(result.totalPages).toEqual(expectedTotalPages);
    });
  });

  describe('createUser', () => {
    const createFormData = (data: Record<string, string | undefined>) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });

      return formData;
    };

    it.each([
      {
        data: {},
        expectedFields: {
          username: 'Required',
          role: 'Required',
        },
      },
      {
        data: {
          username: 'foobar',
          role: 'invalid',
        },
        expectedFields: {
          role: 'Invalid enum value. Expected \'admin\' | \'advanced-user\' | \'managed-user\', received \'invalid\'',
        },
      },
      {
        data: {
          role: 'admin',
        },
        expectedFields: {
          'username': 'Required',
        },
      },
    ])('throws error if provided data is invalid', async ({ data, expectedFields }) => {
      const formData = createFormData(data);

      await expect(usersService.createUser(formData)).rejects.toThrowError(expect.objectContaining({
        message: 'Provided data is invalid',
        invalidFields: expectedFields,
      }));
      expect(createUser).not.toHaveBeenCalled();
    });

    it('throws error if username is duplicated', async () => {
      createUser.mockRejectedValue(new UniqueConstraintViolationException(new Error('')));

      const formData = createFormData({
        username: 'username',
        role: 'managed-user',
      });

      await expect(usersService.createUser(formData)).rejects.toThrowError(new DuplicatedEntryError('username'));
    });

    it('creates a user with a randomly generated password', async () => {
      createUser.mockImplementation(async (firstArg) => firstArg);

      const data = {
        username: 'username',
        displayName: 'Display Name',
        role: 'admin',
      };
      const formData = createFormData(data);

      const [user, plainTextPassword] = await usersService.createUser(formData);

      expect(createUser).toHaveBeenCalledWith(expect.objectContaining(data));
      expect(await verifyPassword(plainTextPassword, user.password)).toEqual(true);
    });
  });

  describe('deleteUser', () => {
    it('deletes user via repository', async () => {
      await usersService.deleteUser('123');
      expect(deleteUser).toHaveBeenCalledWith('123');
    });
  });
});
