import { screen } from '@testing-library/react';
import { fromPartial } from '@total-typescript/shoehorn';
import { createRoutesStub } from 'react-router';
import type { Server } from '../../../../app/entities/Server';
import EditServer, { action, loader } from '../../../../app/routes/servers/edit-server';
import type { ServersService } from '../../../../app/servers/ServersService.server';
import { NotFoundError } from '../../../../app/validation/NotFoundError.server';
import { checkAccessibility } from '../../../__helpers__/accessibility';
import { renderWithEvents } from '../../../__helpers__/set-up-test';

describe('edit-server', () => {
  const getByPublicIdAndUser = vi.fn();
  const editServerForUser = vi.fn().mockResolvedValue(undefined);
  const serversService: ServersService = fromPartial({ getByPublicIdAndUser, editServerForUser });

  describe('loader', () => {
    const runLoader = () => loader(fromPartial({
      context: { get: vi.fn().mockReturnValue({ publicId: '123' }) },
      params: { serverPublicId: 'abc456' },
    }), serversService);

    it('throws 404 response when server is not found', async () => {
      getByPublicIdAndUser.mockRejectedValue(new NotFoundError('Server not found'));
      await expect(runLoader()).rejects.toThrow(expect.objectContaining({ status: 404 }));
    });

    it('throws unknown errors verbatim', async () => {
      const unknownError = new Error('Oops!');
      getByPublicIdAndUser.mockRejectedValue(unknownError);
      await expect(runLoader()).rejects.toThrow(unknownError);
    });

    it('returns server data when found', async () => {
      const server: Server = fromPartial({});
      getByPublicIdAndUser.mockResolvedValue(server);

      const result = await runLoader();
      expect(result.server).toStrictEqual(server);
    });
  });

  describe('action', () => {
    const runAction = () => action(fromPartial({
      context: { get: vi.fn().mockReturnValue({ publicId: '123' }) },
      params: { serverPublicId: 'abc456' },
      request: { formData: vi.fn().mockResolvedValue(new FormData()) },
    }), serversService);

    it('creates server and redirects to servers list', async () => {
      const resp = await runAction();

      expect(editServerForUser).toHaveBeenLastCalledWith('123', 'abc456', new FormData());
      expect(resp.status).toEqual(302);
      expect(resp.headers.get('Location')).toEqual('/manage-servers/1');
    });
  });

  describe('<EditServer />', () => {
    const setUp = async () => {
      const path = '/manage-servers/1';
      const Stub = createRoutesStub([
        {
          path,
          Component: EditServer,
          HydrateFallback: () => null,
          loader: () => ({
            server: fromPartial<Server>({ name: 'the name', baseUrl: 'the base url', apiKey: 'the api key' }),
          }),
        },
      ]);

      const result = renderWithEvents(<Stub initialEntries={[path]} />);
      await screen.findByText(/^Edit server/);

      return result;
    };

    it('passes a11y checks', () => checkAccessibility(setUp()));

    it('renders form with initial server data', async () => {
      await setUp();

      expect(screen.getByLabelText(/^Name/)).toHaveValue('the name');
      expect(screen.getByLabelText(/^URL/)).toHaveValue('the base url');
      expect(screen.getByLabelText(/^API key/)).toHaveValue('the api key');
    });
  });
});
