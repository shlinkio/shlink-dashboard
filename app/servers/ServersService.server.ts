import type { Server } from '../entities/Server';
import type { ServersRepository } from './ServersRepository.server';

export class ServersService {
  constructor(private readonly serversRepository: ServersRepository) {}

  public async getByPublicIdAndUser(publicId: string, userId: string): Promise<Server> {
    const server = await this.serversRepository.findByPublicIdAndUserId(publicId, userId);
    if (!server) {
      throw new Error(`Server with public ID ${publicId} not found`);
    }

    return server;
  }

  public async getUserServers(userId: string): Promise<Server[]> {
    return this.serversRepository.findByUserId(userId);
  }
}
