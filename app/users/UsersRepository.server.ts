import type { EntityManager, FilterQuery, RequiredEntityData } from '@mikro-orm/core';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import { BaseEntityRepository } from '../db/BaseEntityRepository';
import { User } from '../entities/User';
import type { UserOrderableFields } from './UsersService.server';

export type FindAndCountUsersOptions = {
  limit: number;
  offset: number;
  orderBy?: Order<UserOrderableFields>;
  searchTerm?: string;
};

export class UsersRepository extends BaseEntityRepository<User> {
  findAndCountUsers({ searchTerm, limit, offset, orderBy }: FindAndCountUsersOptions): Promise<[User[], number]> {
    return this.findAndCount(
      this.buildListUsersWhere(searchTerm),
      {
        limit,
        offset,
        orderBy: {
          [orderBy?.field ?? 'createdAt']: orderBy?.dir ?? 'DESC',
        },
      },
    );
  }

  private buildListUsersWhere(searchTerm?: string): FilterQuery<User> {
    if (!searchTerm) {
      return {};
    }

    const searchableFields: Array<keyof User> = ['displayName', 'username'];
    const lowerSearchTerm = searchTerm.toLowerCase();

    return {
      $or: searchableFields.flatMap((field) => [
        {
          [field]: {
            $like: `%${lowerSearchTerm}%`,
          },
        },
        {
          [field]: {
            $like: `%${searchTerm}%`,
          },
        },
      ]),
    };
  }

  async createUser(userData: Omit<RequiredEntityData<User>, 'createdAt'>): Promise<User> {
    const user = this.create({ ...userData, createdAt: new Date() });
    await this.em.persist(user).flush();

    return user;
  }
}

export function createUsersRepository(em: EntityManager): UsersRepository {
  return em.getRepository(User);
}
