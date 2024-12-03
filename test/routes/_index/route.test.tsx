import { json } from '@remix-run/node';
import { createRemixStub } from '@remix-run/testing';
import { render, screen, waitFor } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import type { AuthHelper } from '../../../app/auth/auth-helper.server';
import type { SessionData } from '../../../app/auth/session-context';
import type { Server } from '../../../app/entities/Server';
import Index, { loader } from '../../../app/routes/_index/route';
import type { ServersService } from '../../../app/servers/ServersService.server';

describe('_index.route', () => {
  describe('loader', () => {
    const getSession = vi.fn();
    const authHelper: AuthHelper = fromPartial({ getSession });
    const getUserServers = vi.fn();
    const serversService: ServersService = fromPartial({ getUserServers });

    it('returns list of servers', async () => {
      const sessionData: SessionData = fromPartial({ userId: '1' });
      getSession.mockResolvedValue(sessionData);

      const servers: Server[] = [fromPartial({})];
      getUserServers.mockResolvedValue(servers);

      const request: Request = fromPartial({});
      const data = await loader(fromPartial({ request }), serversService, authHelper);

      expect(data.servers).toStrictEqual(servers);
      expect(getSession).toHaveBeenCalledWith(request, '/login');
      expect(getUserServers).toHaveBeenCalledWith(sessionData.userId);
    });

    it.todo('redirects to login if session is not set');
  });

  describe('<Index />', () => {
    const setUp = (servers: Server[] = []) => {
      const RemixStub = createRemixStub([
        {
          path: '/',
          Component: Index,
          loader: () => json({ servers }),
        },
      ]);
      return render(<RemixStub />);
    };

    it('renders no-servers welcome page when there are no servers', async () => {
      setUp();

      await waitFor(() => expect(
        screen.getByText('This application will help you manage your Shlink servers.'),
      ).toBeInTheDocument());
      expect(screen.queryByTestId('servers-list')).not.toBeInTheDocument();
    });

    it('renders servers list when there is more than one server', async () => {
      setUp([fromPartial({ name: '1', publicId: '1' })]);

      await waitFor(() => expect(screen.getByTestId('servers-list')).toBeInTheDocument());
      expect(screen.queryByText('This application will help you manage your Shlink servers.')).not.toBeInTheDocument();
    });
  });
});
