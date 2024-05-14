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
  const upsert = vi.fn();
  const create = vi.fn();
  const save = vi.fn();
  const em = fromPartial<EntityManager>({
    find,
    findOneBy,
    transaction,
    upsert,
    create,
    save,
    connection: {
      options: { type: 'mysql' },
    },
  });
  let tagsService: TagsService;

  beforeEach(() => {
    tagsService = new TagsService(em);
    transaction.mockImplementation((callback) => callback(em));
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

    it('upserts tags for non-ms databases', async () => {
      const server = fromPartial<Server>({});
      const user = fromPartial<User>({});
      const colors = { foo: 'red', bar: 'green' };

      findOneBy
        .mockResolvedValueOnce(server)
        .mockResolvedValueOnce(user);

      await tagsService.updateTagColors({ userId: 1, serverPublicId: '2', colors });

      expect(transaction).toHaveBeenCalled();
      expect(upsert).toHaveBeenCalledWith(
        TagEntity,
        [{ tag: 'foo', color: 'red', user, server }, { tag: 'bar', color: 'green', user, server }],
        ['tag', 'user', 'server'],
      );
      expect(create).not.toHaveBeenCalled();
      expect(save).not.toHaveBeenCalled();
    });

    it('reads and creates/updates for ms databases', async () => {
      Object.assign(em.connection.options, { type: 'mssql' });

      const server = fromPartial<Server>({});
      const user = fromPartial<User>({});
      const firstTag = fromPartial<Tag>({ tag: 'foo', user, server });
      const secondTag = fromPartial<Tag>({ tag: 'bar', user, server });
      const colors = { foo: 'red', bar: 'green' };

      findOneBy
        .mockResolvedValueOnce(server)
        .mockResolvedValueOnce(user)
        .mockResolvedValueOnce(firstTag) // First tag
        .mockResolvedValueOnce(null); // Second tag. It does not exist
      create.mockReturnValue(secondTag);

      await tagsService.updateTagColors({ userId: 1, serverPublicId: '2', colors });

      expect(transaction).toHaveBeenCalled();
      expect(create).toHaveBeenCalledWith(TagEntity, { user, server, tag: 'bar', color: 'green' });
      expect(save).toHaveBeenCalledTimes(2);
      expect(save).toHaveBeenNthCalledWith(1, firstTag);
      expect(save).toHaveBeenNthCalledWith(2, secondTag);
      expect(upsert).not.toHaveBeenCalled();
    });
  });
});
