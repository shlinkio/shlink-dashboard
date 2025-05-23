import type { EntityManager } from '@mikro-orm/core';
import type { Order } from '@shlinkio/shlink-frontend-kit';
import { BaseEntityRepository } from '../db/BaseEntityRepository.server';
import { expandSearchTerm } from '../db/utils.server';
import { User } from '../entities/User';
import type { CreateUserData } from './user-schemas.server';
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
      expandSearchTerm<User>(searchTerm, { searchableFields: ['displayName', 'username'] }),
      {
        limit,
        offset,
        orderBy: {
          [orderBy?.field ?? 'createdAt']: orderBy?.dir ?? 'DESC',
        },
      },
    );
  }

  /**
   * Create a user with a temporary password
   */
  async createUser({ tempPassword: password, ...userData }: CreateUserData & { tempPassword: string }): Promise<User> {
    const user = this.create({
      ...userData,
      password,
      tempPassword: true,
      createdAt: new Date(),
      publicId: crypto.randomUUID(),
    });
    await this.em.persistAndFlush(user);

    return user;
  }
}

export function createUsersRepository(em: EntityManager): UsersRepository {
  return em.getRepository(User);
}
