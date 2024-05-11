import type { EntityManager } from 'typeorm';
import { appDataSource } from '../db/data-source.server';
import type { Server } from '../entities/Server';
import { ServerEntity } from '../entities/Server';

export class ServersService {
  constructor(private readonly em: EntityManager = appDataSource.manager) {}

  public async getByPublicId(publicId: string): Promise<Server> {
    const server = await this.em.findOneBy(ServerEntity, { publicId });
    if (!server) {
      throw new Error(`Server with public ID ${publicId} not found`);
    }

    return server;
  }
}
