import { fromPartial } from '@total-typescript/shoehorn';
import { action } from '../../../app/routes/servers/create-server';
import type { ServersService } from '../../../app/servers/ServersService.server';

describe('create-server', () => {
  describe('action', () => {
    const createServerForUser = vi.fn();
    const serversService: ServersService = fromPartial({ createServerForUser });
    const runAction = () => action(
      fromPartial({
        request: { formData: vi.fn().mockResolvedValue(new FormData()) },
        context: { get: vi.fn().mockReturnValue({ publicId: '123' }) },
      }),
      serversService,
    );

    it('redirects to servers list after creating a server', async () => {
      const resp = await runAction();

      expect(resp.status).toEqual(302);
      expect(resp.headers.get('Location')).toEqual('/manage-servers/1');
      expect(createServerForUser).toHaveBeenLastCalledWith('123', new FormData());
    });
  });
});
