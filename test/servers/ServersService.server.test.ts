import { fromPartial } from '@total-typescript/shoehorn';
import type { Server } from '../../app/entities/Server';
import type { ServersRepository } from '../../app/servers/ServersRepository.server';
import { ServersService } from '../../app/servers/ServersService.server';

describe('ServersService', () => {
  const findByPublicIdAndUserId = vi.fn();
  let repo: ServersRepository;
  let service: ServersService;

  beforeEach(() => {
    repo = fromPartial<ServersRepository>({ findByPublicIdAndUserId });
    service = new ServersService(repo);
  });

  describe('getByPublicIdAndUser', () => {
    it('throws error if server is not found', async () => {
      await expect(() => service.getByPublicIdAndUser('123', '1')).rejects.toEqual(
        new Error('Server with public ID 123 not found'),
      );
    });

    it('returns server when found', async () => {
      const server = fromPartial<Server>({});
      findByPublicIdAndUserId.mockResolvedValue(server);

      const result = await service.getByPublicIdAndUser('123', '1');

      expect(result).toEqual(server);
    });
  });
});
