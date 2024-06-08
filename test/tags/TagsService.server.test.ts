import type { EntityManager } from '@mikro-orm/core';
import { fromPartial } from '@total-typescript/shoehorn';
import type { Server } from '../../app/entities/Server';
import type { Tag } from '../../app/entities/Tag';
import { Tag as TagEntity } from '../../app/entities/Tag';
import type { User } from '../../app/entities/User';
import { User as UserEntity } from '../../app/entities/User';
import type { ServersService } from '../../app/servers/ServersService.server';
import { TagsService } from '../../app/tags/TagsService.server';

describe('TagsService', () => {
  const find = vi.fn();
  const findOne = vi.fn();
  const transactional = vi.fn();
  const upsert = vi.fn();
  const em = fromPartial<EntityManager>({
    find,
    findOne,
    transactional,
    upsert,
  });
  const getByPublicIdAndUser = vi.fn();
  const serversService = fromPartial<ServersService>({ getByPublicIdAndUser });
  let tagsService: TagsService;

  beforeEach(() => {
    tagsService = new TagsService(em, serversService);
    transactional.mockImplementation((callback) => callback(em));
  });

  describe('tagColors', () => {
    it.each([
      [null, null],
      [fromPartial<Server>({}), null],
      [null, fromPartial<User>({})],
    ])('returns empty map when server or user are not found', async (server, user) => {
      getByPublicIdAndUser.mockResolvedValue(server);
      findOne.mockResolvedValue(user);

      const result = await tagsService.tagColors({ userId: '1', serverPublicId: '2' });

      expect(result).toEqual({});
      expect(find).not.toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledWith(UserEntity, { id: '1' });
      expect(getByPublicIdAndUser).toHaveBeenCalledWith('2', '1');
    });

    it('returns empty map serverPublicId is not provided', async () => {
      findOne.mockResolvedValue(fromPartial<User>({}));

      const result = await tagsService.tagColors({ userId: '1' });

      expect(result).toEqual({});
      expect(find).not.toHaveBeenCalled();
      expect(getByPublicIdAndUser).not.toHaveBeenCalled();
      expect(findOne).toHaveBeenCalledOnce();
    });

    it('maps tag colors for provided user and server', async () => {
      const server = fromPartial<Server>({});
      const user = fromPartial<User>({});

      getByPublicIdAndUser.mockResolvedValue(server);
      findOne.mockResolvedValue(user);
      find.mockResolvedValue([
        fromPartial<Tag>({ tag: 'foo', color: 'red' }),
        fromPartial<Tag>({ tag: 'bar', color: 'green' }),
        fromPartial<Tag>({ tag: 'baz', color: 'yellow' }),
      ]);

      const result = await tagsService.tagColors({ userId: '1', serverPublicId: '2' });

      expect(result).toEqual({ foo: 'red', bar: 'green', baz: 'yellow' });
      expect(find).toHaveBeenCalledWith(TagEntity, { user, server });
      expect(getByPublicIdAndUser).toHaveBeenCalledWith('2', '1');
      expect(findOne).toHaveBeenCalledWith(UserEntity, { id: '1' });
    });
  });

  describe('updateTagColors', () => {
    it.each([
      [null, null],
      [fromPartial<Server>({}), null],
      [null, fromPartial<User>({})],
    ])('does nothing when server or user are not found', async (server, user) => {
      getByPublicIdAndUser.mockResolvedValue(server);
      findOne.mockResolvedValue(user);

      await tagsService.updateTagColors({ userId: '1', serverPublicId: '2', colors: {} });

      expect(transactional).not.toHaveBeenCalled();
      expect(getByPublicIdAndUser).toHaveBeenCalledWith('2', '1');
      expect(findOne).toHaveBeenCalledWith(UserEntity, { id: '1' });
    });

    it('upserts tags for non-ms databases', async () => {
      const server = fromPartial<Server>({});
      const user = fromPartial<User>({});
      const colors = { foo: 'red', bar: 'green', baz: 'yellow' };

      getByPublicIdAndUser.mockResolvedValue(server);
      findOne.mockResolvedValue(user);

      await tagsService.updateTagColors({ userId: '1', serverPublicId: '2', colors });

      expect(transactional).toHaveBeenCalled();
      expect(upsert).toHaveBeenCalledTimes(3);
      expect(upsert).toHaveBeenNthCalledWith(
        1,
        TagEntity,
        { tag: 'foo', color: 'red', user, server },
        { onConflictFields: ['tag', 'user', 'server'] },
      );
      expect(upsert).toHaveBeenNthCalledWith(
        2,
        TagEntity,
        { tag: 'bar', color: 'green', user, server },
        { onConflictFields: ['tag', 'user', 'server'] },
      );
    });
  });
});
