import { fromPartial } from '@total-typescript/shoehorn';
import type { EntityManager } from 'typeorm';
import type { Server } from '../../app/entities/Server';
import { ServersService } from '../../app/servers/ServersService.server';

describe('ServersService', () => {
  const findOneBy = vi.fn();
  let em: EntityManager;
  let service: ServersService;

  beforeEach(() => {
    em = fromPartial<EntityManager>({ findOneBy });
    service = new ServersService(em);
    vi.clearAllMocks();
  });

  describe('getByPublicId', () => {
    it('throws error if server is not found', async () => {
      await expect(() => service.getByPublicId('123')).rejects.toEqual(
        new Error('Server with public ID 123 not found'),
      );
    });

    it('returns server when found', async () => {
      const server = fromPartial<Server>({});
      findOneBy.mockResolvedValue(server);

      const result = await service.getByPublicId('123');

      expect(result).toEqual(server);
    });
  });
});
