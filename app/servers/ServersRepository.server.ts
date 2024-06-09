import type { EntityManager } from '@mikro-orm/core';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Server } from '../entities/Server';

export class ServersRepository extends EntityRepository<Server> {
  findByPublicIdAndUserId(publicId: string, userId: string): Promise<Server | null> {
    const qb = this.em.qb(Server, 'server');
    qb.innerJoin('server.users', 'user')
      .where({ publicId, 'user.id': userId })
      .limit(1);

    return qb.getSingleResult();
  }

  findByUserId(userId: string): Promise<Server[]> {
    const qb = this.em.qb(Server, 'server');
    qb.innerJoin('server.users', 'user')
      .where({ 'user.id': userId })
      .orderBy({ name: 'ASC' });

    return qb.getResult();
  }
}

export function createServersRepository(em: EntityManager): ServersRepository {
  return em.getRepository(Server);
}
