import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import { action } from '../../../app/routes/servers/create-server';
import type { ServersService } from '../../../app/servers/ServersService.server';

describe('create-server', () => {
  describe('action', () => {
    const getSession = vi.fn().mockReturnValue({ role: 'admin', userId: '123' });
    const authHelper: AuthHelper = fromPartial({ getSession });
    const createServerForUser = vi.fn();
    const serversService: ServersService = fromPartial({ createServerForUser });
    const runAction = () => action(
      fromPartial({
        request: fromPartial({ formData: vi.fn().mockResolvedValue(new FormData()) }),
      }),
      authHelper,
      serversService,
    );

    it('redirects to servers list after creating a server', async () => {
      const resp = await runAction();

      expect(resp.status).toEqual(302);
      expect(resp.headers.get('Location')).toEqual('/manage-servers/1');
      expect(createServerForUser).toHaveBeenLastCalledWith('123', new FormData());
    });
  });

  describe.skip('<CreateServer />', () => {
    const setUp = () => {
      const path = '/manage-servers/create';
      const Stub = createRoutesStub([
        {
          path,
        },
      ]);
    };
  });
});
