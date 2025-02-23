import type { EntityManager } from '@mikro-orm/core';
import { fromPartial } from '@total-typescript/shoehorn';
import { hashPassword } from '../../app/auth/passwords.server';
import type { User } from '../../app/entities/User';
import { UsersService } from '../../app/users/UsersService.server';

describe('UsersService', () => {
  const findOne = vi.fn();
  const findAndCount = vi.fn();
  let em: EntityManager;
  let usersService: UsersService;

  beforeEach(() => {
    em = fromPartial<EntityManager>({ findOne, findAndCount });
    usersService = new UsersService(em);
  });

  describe('getUserByCredentials', () => {
    it('throws when user is not found', async () => {
      findOne.mockResolvedValue(null);
      await expect(() => usersService.getUserByCredentials('foo', 'bar')).rejects.toEqual(
        new Error('User not found with username foo'),
      );
    });

    it('throws if password does not match', async () => {
      findOne.mockResolvedValue(fromPartial<User>({ password: await hashPassword('the right one') }));
      await expect(() => usersService.getUserByCredentials('foo', 'bar')).rejects.toEqual(
        new Error('Incorrect password for user foo'),
      );
    });

    it('returns user if password is correct', async () => {
      const expectedUser = fromPartial<User>({ password: await hashPassword('bar') });
      findOne.mockResolvedValue(expectedUser);

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
      findAndCount.mockResolvedValue([users, totalUsers]);

      const result = await usersService.listUsers({ page });

      expect(findAndCount).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.objectContaining({
        offset: expectedOffset,
      }));
      expect(result.users).toEqual(users);
      expect(result.totalUsers).toEqual(totalUsers);
      expect(result.totalPages).toEqual(expectedTotalPages);
    });

    it.each([
      {
        orderBy: undefined,
        expectedOrderBy: { createdAt: 'ASC' },
      },
      {
        orderBy: { field: 'createdAt' as const, dir: 'ASC' as const },
        expectedOrderBy: { createdAt: 'ASC' },
      },
      {
        orderBy: { field: 'username' as const, dir: 'DESC' as const },
        expectedOrderBy: { username: 'DESC' },
      },
    ])('orders by expected field', async ({ orderBy, expectedOrderBy }) => {
      findAndCount.mockResolvedValue([[], 0]);

      await usersService.listUsers({ orderBy });

      expect(findAndCount).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.objectContaining({
        orderBy: expectedOrderBy,
      }));
    });
  });
});
