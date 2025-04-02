import { fromPartial } from '@total-typescript/shoehorn';
import type { Server } from '../../app/entities/Server';
import type { ServersRepository } from '../../app/servers/ServersRepository.server';
import type { ListServersOptions } from '../../app/servers/ServersService.server';
import { ServersService } from '../../app/servers/ServersService.server';
import { NotFoundError } from '../../app/validation/NotFoundError.server';
import { createFormData } from '../__helpers__/utils';

describe('ServersService', () => {
  const findByPublicIdAndUserId = vi.fn();
  const findByUserId = vi.fn();
  const createServer = vi.fn().mockReturnValue({});
  const nativeDelete = vi.fn();
  const repo: ServersRepository = fromPartial({ findByPublicIdAndUserId, findByUserId, createServer, nativeDelete });
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
      { userId: '3', options: undefined },
      { userId: '87', options: fromPartial<ListServersOptions>({}) },
    ])('delegates into repository', ({ userId, options }) => {
      service.getUserServers(userId, options);
      expect(findByUserId).toHaveBeenCalledWith(userId, options);
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

  describe('deleteServerForUser', () => {
    it('delegates into repository', async () => {
      await service.deleteServerForUser('123', 'abc');
      expect(nativeDelete).toHaveBeenCalledWith({
        publicId: 'abc',
        users: { id: '123' },
      });
    });
  });
});
