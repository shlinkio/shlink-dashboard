import type { EntityManager } from '@mikro-orm/core';
import { BaseEntityRepository } from '../db/BaseEntityRepository';
import { Server } from '../entities/Server';

export class ServersRepository extends BaseEntityRepository<Server> {
  findByPublicIdAndUserId(publicId: string, userId: string): Promise<Server | null> {
    return this.em.findOne(Server, {
      publicId,
      users: { id: userId },
    });
  }

  findByUserId(userId: string): Promise<Server[]> {
    return this.em.find(Server, {
      users: { id: userId },
    }, {
      orderBy: { name: 'ASC' },
    });
  }
}

export function createServersRepository(em: EntityManager): ServersRepository {
  return em.getRepository(Server);
}
