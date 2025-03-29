import type { Server } from '../entities/Server';
import { NotFoundError } from '../validation/NotFoundError.server';
import type { FindServersOptions, ServersRepository } from './ServersRepository.server';

export type ListServersOptions = FindServersOptions;

export class ServersService {
  readonly #serversRepository: ServersRepository;

  constructor(serversRepository: ServersRepository) {
    this.#serversRepository = serversRepository;
  }

  public async getByPublicIdAndUser(publicId: string, userId: string): Promise<Server> {
    const server = await this.#serversRepository.findByPublicIdAndUserId(publicId, userId);
    if (!server) {
      throw new NotFoundError(`Server with public ID ${publicId} not found`);
    }

    return server;
  }

  public async getUserServers(userId: string, options?: ListServersOptions): Promise<Server[]> {
    return this.#serversRepository.findByUserId(userId, options);
  }
}
