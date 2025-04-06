import type { Server } from '../entities/Server';
import { NotFoundError } from '../validation/NotFoundError.server';
import { validateFormDataSchema } from '../validation/validator.server';
import { CREATE_SERVER_SCHEMA, EDIT_SERVER_SCHEMA, USER_SERVERS } from './server-schemas';
import type { FindServersOptions, ServersRepository } from './ServersRepository.server';

export type ListServersOptions = FindServersOptions;

function ensureServer(server: Server | null, serverPublicId: string): Server {
  if (!server) {
    throw new NotFoundError(`Server with public ID ${serverPublicId} not found`);
  }

  return server;
}

export class ServersService {
  readonly #serversRepository: ServersRepository;

  constructor(serversRepository: ServersRepository) {
    this.#serversRepository = serversRepository;
  }

  public async getByPublicIdAndUser(serverPublicId: string, userId: string): Promise<Server> {
    const server = await this.#serversRepository.findByPublicIdAndUserId(serverPublicId, userId);
    return ensureServer(server, serverPublicId);
  }

  public async getUserServers(userId: string, options?: ListServersOptions): Promise<Server[]> {
    return this.#serversRepository.findByUserId(userId, options);
  }

  public async createServerForUser(userId: string, data: FormData): Promise<Server> {
    const serverData = validateFormDataSchema(CREATE_SERVER_SCHEMA, data);
    return this.#serversRepository.createServer(userId, serverData);
  }

  public async editServerForUser(userId: string, serverPublicId: string, data: FormData): Promise<Server> {
    const serverData = validateFormDataSchema(EDIT_SERVER_SCHEMA, data);
    const server = await this.#serversRepository.updateServer(serverPublicId, userId, serverData);

    return ensureServer(server, serverPublicId);
  }

  public async deleteServerForUser(userId: string, serverPublicId: string): Promise<number> {
    return this.#serversRepository.nativeDelete({
      publicId: serverPublicId,
      users: { id: userId },
    });
  }

  public async setServersForUser(userId: string, data: FormData): Promise<void> {
    const servers = validateFormDataSchema(USER_SERVERS, data);
    await this.#serversRepository.setServersForUser(userId, servers);
  }
}
