import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { BaseEntityRepository } from '../db/BaseEntityRepository';
import { Server } from '../entities/Server';

export type FindServersOptions = {
  searchTerm?: string;
  populateUsers?: boolean;
};

export class ServersRepository extends BaseEntityRepository<Server> {
  findByPublicIdAndUserId(publicId: string, userId: string): Promise<Server | null> {
    return this.findOne({
      publicId,
      users: { id: userId },
    });
  }

  findByUserId(userId: string, { searchTerm, populateUsers = false }: FindServersOptions = {}): Promise<Server[]> {
    return this.find(this.buildListServersWhere(userId, searchTerm), {
      orderBy: { name: 'ASC' },
      populate: populateUsers ? ['users'] : undefined,
    });
  }

  private buildListServersWhere(userId: string, searchTerm?: string): FilterQuery<Server> {
    const baseFilter: FilterQuery<Server> = {
      users: { id: userId },
    };

    if (!searchTerm) {
      return baseFilter;
    }

    const searchableFields: Array<keyof Server> = ['name', 'baseUrl'];
    const lowerSearchTerm = searchTerm.toLowerCase();

    baseFilter['$or'] = searchableFields.flatMap((field) => [
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
    ]);

    return baseFilter;
  }
}

export function createServersRepository(em: EntityManager): ServersRepository {
  return em.getRepository(Server);
}
