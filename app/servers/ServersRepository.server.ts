import type { EntityManager } from 'typeorm';
import type { Server } from '../entities/Server';
import { ServerEntity } from '../entities/Server';

export function createServersRepository(em: EntityManager) {
  return em.getRepository(ServerEntity).extend({
    findByPublicIdAndUserId(publicId: string, userId: number): Promise<Server | null> {
      const qb = this.createQueryBuilder('server');
      qb.innerJoin('server.users', 'user')
        .where('server.publicId = :publicId', { publicId })
        .andWhere('user.id = :userId', { userId: `${userId}` });

      return qb.getOne();
    },
  });
}

export type ServersRepository = ReturnType<typeof createServersRepository>;
