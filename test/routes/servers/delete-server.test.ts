import { fromPartial } from '@total-typescript/shoehorn';
import { action } from '../../../app/routes/servers/delete-server';
import type { ServersService } from '../../../app/servers/ServersService.server';

describe('delete-server', () => {
  describe('action', () => {
    const deleteServerForUser = vi.fn();
    const serversService: ServersService = fromPartial({ deleteServerForUser });
    const runAction = () => action(
      fromPartial({
        request: fromPartial({ json: vi.fn().mockResolvedValue({ serverPublicId: 'serverPublicId' }) }),
        context: { get: vi.fn().mockReturnValue({ userId: 'userId' }) },
      }),
      serversService,
    );

    it('deletes server for current user', async () => {
      await runAction();
      expect(deleteServerForUser).toHaveBeenCalledWith('userId', 'serverPublicId');
    });
  });
});
