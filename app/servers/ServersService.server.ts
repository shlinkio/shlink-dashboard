import type { Server } from '../entities/Server';
import { NotFoundError } from '../validation/NotFoundError.server';
import { validateFormDataSchema } from '../validation/validator.server';
import { CREATE_SERVER_SCHEMA } from './server-schemas';
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

  public async createServerForUser(userId: string, data: FormData): Promise<Server> {
    const serverData = validateFormDataSchema(CREATE_SERVER_SCHEMA, data);
    return this.#serversRepository.createServer(userId, serverData);
  }

  public async deleteServerForUser(userId: string, serverPublicId: string): Promise<number> {
    return this.#serversRepository.nativeDelete({
      publicId: serverPublicId,
      users: { id: userId },
    });
  }
}
