import { fromPartial } from '@total-typescript/shoehorn';
import type { Server } from '../../app/entities/Server';
import type { FindServersOptions, ServersRepository } from '../../app/servers/ServersRepository.server';
import type { ListServersOptions } from '../../app/servers/ServersService.server';
import { ServersService } from '../../app/servers/ServersService.server';
import { NotFoundError } from '../../app/validation/NotFoundError.server';
import { createFormData } from '../__helpers__/utils';

describe('ServersService', () => {
  const findByPublicIdAndUserId = vi.fn();
  const findByUserId = vi.fn();
  const createServer = vi.fn().mockReturnValue({});
  const updateServer = vi.fn();
  const nativeDelete = vi.fn();
  const setServersForUser = vi.fn();
  const repo: ServersRepository = fromPartial(
    { findByPublicIdAndUserId, findByUserId, createServer, updateServer, nativeDelete, setServersForUser },
  );
  let service: ServersService;

  beforeEach(() => {
    service = new ServersService(repo);
  });

  describe('getByPublicIdAndUser', () => {
    it('throws error if server is not found', async () => {
      await expect(() => service.getByPublicIdAndUser('123', '1')).rejects.toEqual(
        new NotFoundError('Server with public ID 123 not found'),
      );
    });

    it('returns server when found', async () => {
      const server = fromPartial<Server>({});
      findByPublicIdAndUserId.mockResolvedValue(server);

      const result = await service.getByPublicIdAndUser('123', '1');

      expect(result).toEqual(server);
    });
  });

  describe('getUserServers', () => {
    it.each([
      {
        userId: '3',
        options: undefined,
        expectedRepoOptions: {},
      },
      {
        userId: '87',
        options: fromPartial<ListServersOptions>({}),
        expectedRepoOptions: {},
      },
      {
        userId: '87',
        options: fromPartial<ListServersOptions>({ itemsPerPage: 20, page: 5 }),
        expectedRepoOptions: fromPartial<FindServersOptions>({ limit: 20, offset: 80 }),
      },
    ])('delegates into repository', ({ userId, options, expectedRepoOptions }) => {
      service.getUserServers(userId, options);
      expect(findByUserId).toHaveBeenCalledWith(userId, expectedRepoOptions);
    });
  });

  describe('createServerForUser', () => {
    it.each([
      {},
      { baseUrl: 'not a URL' },
      { name: 'too long'.repeat(50) },
    ])('throws if invalid data is provided', async (data) => {
      await expect(service.createServerForUser('123', createFormData(data))).rejects.toEqual(expect.objectContaining({
        name: 'ValidationError',
      }));
      expect(createServer).not.toHaveBeenCalled();
    });

    it('delegates into repository', async () => {
      await service.createServerForUser('123', createFormData({
        name: '  The server',
        baseUrl: 'https://example.com  ',
        apiKey: '  abc123  ',
      }));
      expect(createServer).toHaveBeenCalledWith('123', {
        name: 'The server',
        baseUrl: 'https://example.com',
        apiKey: 'abc123',
      });
    });
  });

  describe('editServerForUser', () => {
    it.each([
      { baseUrl: 'not a URL' },
      { name: 'too long'.repeat(50) },
    ])('throws if invalid data is provided', async (data) => {
      await expect(service.editServerForUser('123', 'abc123', createFormData(data))).rejects.toEqual(
        expect.objectContaining({ name: 'ValidationError' }),
      );
      expect(updateServer).not.toHaveBeenCalled();
    });

    it('throws if the server is not found', async () => {
      updateServer.mockResolvedValue(null);

      await expect(service.editServerForUser('123', 'abc123', createFormData({}))).rejects.toEqual(
        expect.objectContaining({ name: 'NotFoundError' }),
      );
      expect(updateServer).toHaveBeenCalledWith('abc123', '123', {});
    });

    it('delegates into repository to return updated server', async () => {
      const server: Server = fromPartial({});
      updateServer.mockResolvedValue(server);

      const result = await service.editServerForUser('123', 'abc456', createFormData({}));

      expect(result).toStrictEqual(server);
      expect(updateServer).toHaveBeenCalledWith('abc456', '123', {});
    });
  });

  describe('deleteServerForUser', () => {
    it('delegates into repository', async () => {
      await service.deleteServerForUser('123', 'abc');
      expect(nativeDelete).toHaveBeenCalledWith({
        publicId: 'abc',
        users: { id: '123' },
      });
    });
  });

  describe('setServersForUser', () => {
    it.each([
      { servers: 'not an array' },
      { servers: ['not a uuid'] },
    ])('throws if invalid data is provided', async (data) => {
      await expect(service.setServersForUser('123', createFormData(data))).rejects.toEqual(
        expect.objectContaining({ name: 'ValidationError' }),
      );
      expect(setServersForUser).not.toHaveBeenCalled();
    });

    it('delegates into repository', async () => {
      const data = { servers: [crypto.randomUUID(), crypto.randomUUID()] };
      await service.setServersForUser('123', createFormData(data));
      expect(setServersForUser).toHaveBeenCalledWith('123', data);
    });
  });
});
