import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { BaseEntityRepository } from '../db/BaseEntityRepository';
import { expandSearchTerm } from '../db/utils.server';
import { Server } from '../entities/Server';
import { User } from '../entities/User';
import type { ServerData } from './server-schemas';

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
    const baseFilter: FilterQuery<Server> = {
      users: { id: userId },
    };
    return this.find(expandSearchTerm<Server>(searchTerm, { searchableFields: ['name', 'baseUrl'], baseFilter }), {
      orderBy: { name: 'ASC' },
      populate: populateUsers ? ['users'] : undefined,
    });
  }

  async createServer(userId: string, serverData: ServerData): Promise<Server> {
    const user = this.em.getReference(User, userId);
    const server = this.create({ publicId: crypto.randomUUID(), ...serverData });
    server.users.add(user);

    await this.em.persistAndFlush(server);

    return server;
  }
}

export function createServersRepository(em: EntityManager): ServersRepository {
  return em.getRepository(Server);
}
