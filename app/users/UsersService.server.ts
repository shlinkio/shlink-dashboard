import type { EntityManager } from '@mikro-orm/core';
import { verifyPassword } from '../auth/passwords.server';
import type { User } from '../entities/User';
import { User as UserEntity } from '../entities/User';

type OrderableFields = keyof Omit<User, 'id' | 'password'>;

export type ListUsersOptions = {
  page?: number;
  orderBy?: {
    field: OrderableFields,
    direction?: 'ASC' | 'DESC',
  };
};

export type UsersList = {
  users: User[];
  totalUsers: number;
  totalPages: number;
};

export class UsersService {
  constructor(private readonly em: EntityManager) {}

  async getUserByCredentials(username: string, password: string): Promise<User> {
    const user = await this.em.findOne(UserEntity, { username });
    if (!user) {
      throw new Error(`User not found with username ${username}`);
    }

    const isPasswordCorrect = await verifyPassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new Error(`Incorrect password for user ${username}`);
    }

    return user;
  }

  async listUsers({
    page = 1,
    orderBy = { field: 'username' },
  }: ListUsersOptions): Promise<UsersList> {
    const positivePage = Math.max(1, page);
    const limit = 20;
    const offset = (positivePage - 1) * limit;

    const [users, totalUsers] = await this.em.findAndCount(UserEntity, {}, {
      limit,
      offset,
      orderBy: {
        [orderBy.field]: orderBy.direction ?? 'ASC',
      },
    });

    return {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }
}
