import { fromPartial } from '@total-typescript/shoehorn';
import type { EntityManager } from 'typeorm';
import type { Server } from '../../app/entities/Server';
import { ServerEntity } from '../../app/entities/Server';
import type { Tag } from '../../app/entities/Tag';
import { TagEntity } from '../../app/entities/Tag';
import type { User } from '../../app/entities/User';
import { UserEntity } from '../../app/entities/User';
import { TagsService } from '../../app/tags/TagsService.server';

describe('TagsService', () => {
  const find = vi.fn();
  const findOneBy = vi.fn();
  const transaction = vi.fn();
  const em = fromPartial<EntityManager>({
    find,
    findOneBy,
    transaction,
  });
  let tagsService: TagsService;

  beforeEach(() => {
    tagsService = new TagsService(em);
    vi.clearAllMocks();
  });

  describe('tagColors', () => {
    it.each([
      [null, null],
      [fromPartial<Server>({}), null],
      [null, fromPartial<User>({})],
    ])('returns empty map when server or user are not found', async (server, user) => {
      findOneBy
        .mockResolvedValueOnce(server)
        .mockResolvedValueOnce(user);

      const result = await tagsService.tagColors({ userId: 1, serverPublicId: '2' });

      expect(result).toEqual({});
      expect(find).not.toHaveBeenCalled();
      expect(findOneBy).toHaveBeenCalledTimes(2);
      expect(findOneBy).toHaveBeenNthCalledWith(1, ServerEntity, { publicId: '2' });
      expect(findOneBy).toHaveBeenNthCalledWith(2, UserEntity, { id: 1 });
    });

    it('returns empty map serverPublicId is not provided', async () => {
      findOneBy.mockResolvedValue(fromPartial<User>({}));

      const result = await tagsService.tagColors({ userId: 1 });

      expect(result).toEqual({});
      expect(find).not.toHaveBeenCalled();
      expect(findOneBy).toHaveBeenCalledOnce();
    });

    it('maps tag colors for provided user and server', async () => {
      const server = fromPartial<Server>({});
      const user = fromPartial<User>({});

      findOneBy
        .mockResolvedValueOnce(server)
        .mockResolvedValueOnce(user);
      find.mockResolvedValue([
        fromPartial<Tag>({ tag: 'foo', color: 'red' }),
        fromPartial<Tag>({ tag: 'bar', color: 'green' }),
        fromPartial<Tag>({ tag: 'baz', color: 'yellow' }),
      ]);

      const result = await tagsService.tagColors({ userId: 1, serverPublicId: '2' });

      expect(result).toEqual({ foo: 'red', bar: 'green', baz: 'yellow' });
      expect(find).toHaveBeenCalledWith(TagEntity, {
        where: { user, server },
        order: { tag: 'ASC' },
      });
      expect(findOneBy).toHaveBeenCalledTimes(2);
      expect(findOneBy).toHaveBeenNthCalledWith(1, ServerEntity, { publicId: '2' });
      expect(findOneBy).toHaveBeenNthCalledWith(2, UserEntity, { id: 1 });
    });
  });

  describe('updateTagColors', () => {
    it.each([
      [null, null],
      [fromPartial<Server>({}), null],
      [null, fromPartial<User>({})],
    ])('does nothing when server or user are not found', async (server, user) => {
      findOneBy
        .mockResolvedValueOnce(server)
        .mockResolvedValueOnce(user);

      await tagsService.updateTagColors({ userId: 1, serverPublicId: '2', colors: {} });

      expect(transaction).not.toHaveBeenCalled();
      expect(findOneBy).toHaveBeenCalledTimes(2);
      expect(findOneBy).toHaveBeenNthCalledWith(1, ServerEntity, { publicId: '2' });
      expect(findOneBy).toHaveBeenNthCalledWith(2, UserEntity, { id: 1 });
    });
  });
});
