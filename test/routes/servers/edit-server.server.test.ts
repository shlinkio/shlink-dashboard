import { fromPartial } from '@total-typescript/shoehorn';
import type { Server } from '../../../app/entities/Server';
import { action, loader } from '../../../app/routes/servers/edit-server';
import type { ServersService } from '../../../app/servers/ServersService.server';
import { NotFoundError } from '../../../app/validation/NotFoundError.server';

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
});
