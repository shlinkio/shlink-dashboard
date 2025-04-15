import { paginationToLimitAndOffset } from '../db/utils.server';
import type { Server } from '../entities/Server';
import { NotFoundError } from '../validation/NotFoundError.server';
import { validateFormDataSchema } from '../validation/validator.server';
import { CREATE_SERVER_SCHEMA, EDIT_SERVER_SCHEMA, USER_SERVERS } from './server-schemas';
import type { FindServersOptions, ServersRepository } from './ServersRepository.server';

export type ListServersOptions = Omit<FindServersOptions, 'limit' | 'offset'> & {
  /** Defaults to first page */
  page?: number;
  /** Defaults to "all" servers */
  itemsPerPage?: number;
};

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

  public async getByPublicIdAndUser(serverPublicId: string, userPublicId: string): Promise<Server> {
    const server = await this.#serversRepository.findByPublicIdAndUserId(serverPublicId, userPublicId);
    return ensureServer(server, serverPublicId);
  }

  public async getUserServers(
    userPublicId: string,
    { page = 1, itemsPerPage, ...rest }: ListServersOptions = {},
  ): Promise<Server[]> {
    const { limit, offset } = paginationToLimitAndOffset(page, itemsPerPage);
    return this.#serversRepository.findByUserId(userPublicId, { limit, offset, ...rest });
  }

  public async createServerForUser(userPublicId: string, data: FormData): Promise<Server> {
    const serverData = validateFormDataSchema(CREATE_SERVER_SCHEMA, data);
    return this.#serversRepository.createServer(userPublicId, serverData);
  }

  public async editServerForUser(userPublicId: string, serverPublicId: string, data: FormData): Promise<Server> {
    const serverData = validateFormDataSchema(EDIT_SERVER_SCHEMA, data);
    const server = await this.#serversRepository.updateServer(serverPublicId, userPublicId, serverData);

    return ensureServer(server, serverPublicId);
  }

  public async deleteServerForUser(userPublicId: string, serverPublicId: string): Promise<number> {
    return this.#serversRepository.nativeDelete({
      publicId: serverPublicId,
      users: { publicId: userPublicId },
    });
  }

  public async setServersForUser(userPublicId: string, data: FormData): Promise<void> {
    const servers = validateFormDataSchema(USER_SERVERS, data);
    await this.#serversRepository.setServersForUser(userPublicId, servers);
  }
}
