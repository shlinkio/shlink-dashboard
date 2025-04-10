import type { EntityManager, FilterQuery } from '@mikro-orm/core';
import { BaseEntityRepository } from '../db/BaseEntityRepository';
import { expandSearchTerm } from '../db/utils.server';
import { Server } from '../entities/Server';
import { User } from '../entities/User';
import { NotFoundError } from '../validation/NotFoundError.server';
import { ValidationError } from '../validation/ValidationError.server';
import type { CreateServerData, EditServerData, UserServers } from './server-schemas';

export type FindServersOptions = {
  limit?: number;
  offset?: number;
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

  findByUserId(
    userId: string,
    { searchTerm, populateUsers = false, limit, offset }: FindServersOptions = {},
  ): Promise<Server[]> {
    const baseFilter: FilterQuery<Server> = {
      users: { id: userId },
    };
    return this.find(expandSearchTerm<Server>(searchTerm, { searchableFields: ['name', 'baseUrl'], baseFilter }), {
      orderBy: { name: 'ASC' },
      populate: populateUsers ? ['users'] : undefined,
      limit,
      offset,
    });
  }

  async createServer(userId: string, serverData: CreateServerData): Promise<Server> {
    const user = this.em.getReference(User, userId);
    const server = this.create({ publicId: crypto.randomUUID(), ...serverData });
    server.users.add(user);

    await this.em.persistAndFlush(server);

    return server;
  }

  async updateServer(publicId: string, userId: string, serverData: EditServerData): Promise<Server | null> {
    const server = await this.findByPublicIdAndUserId(publicId, userId);
    if (!server) {
      return null;
    }

    server.name = serverData.name ?? server.name;
    server.baseUrl = serverData.baseUrl ?? server.baseUrl;
    server.apiKey = serverData.apiKey ?? server.apiKey;

    await this.em.flush();
    return server;
  }

  async setServersForUser(userId: string, { servers: serverPublicIds }: UserServers): Promise<void> {
    const [user, servers] = await Promise.all([
      this.em.findOne(User, { id: userId }, { populate: ['servers'] }),
      serverPublicIds.length > 0 ? this.find({ publicId: { '$in': serverPublicIds } }) : Promise.resolve([]),
    ]);

    if (!user) {
      throw new NotFoundError(`User ${userId} not found`);
    }

    if (user.role !== 'managed-user') {
      throw new ValidationError({ role: 'Servers can be set in managed users only' });
    }

    user.servers.removeAll();
    servers.forEach((server) => user.servers.add(server));

    await this.em.flush();
  }
}

export function createServersRepository(em: EntityManager): ServersRepository {
  return em.getRepository(Server);
}
