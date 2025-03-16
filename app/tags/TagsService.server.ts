import type { EntityManager } from '@mikro-orm/core';
import type { Server } from '../entities/Server';
import { Tag as TagEntity } from '../entities/Tag';
import type { User } from '../entities/User';
import { User as UserEntity } from '../entities/User';
import type { ServersService } from '../servers/ServersService.server';

export type FindTagsParam = {
  userId: string;
  serverPublicId?: string;
};

export type UpdateTagColorsParam = FindTagsParam & {
  colors: Record<string, string>;
};

type ServerAndUserResult = {
  server: Server | null;
  user: User | null;
};

export class TagsService {
  readonly #em: EntityManager;
  readonly #serversService: ServersService;

  constructor(em: EntityManager, serversService: ServersService) {
    this.#em = em;
    this.#serversService = serversService;
  }

  async tagColors(param: FindTagsParam): Promise<Record<string, string>> {
    const { server, user } = await this.resolveServerAndUser(param);
    if (!server || !user) {
      return {};
    }

    const tags = await this.#em.find(TagEntity, { user, server });

    return tags.reduce<Record<string, string>>((acc, tag) => {
      acc[tag.tag] = tag.color;
      return acc;
    }, {});
  }

  async updateTagColors({ colors, ...param }: UpdateTagColorsParam): Promise<void> {
    const { server, user } = await this.resolveServerAndUser(param);
    if (!server || !user) {
      return;
    }

    // FIXME em.upsertMany seems to ignore the options object somehow. Using em.upsert instead
    // await this.#em.transactional((em) => em.upsertMany(
    //   TagEntity,
    //   Object.entries(colors).map(([tag, color]) => ({ tag, color, user, server })),
    //   { onConflictFields: ['tag', 'user', 'server'] },
    // ));
    await this.#em.transactional((em) => Promise.all(Object.entries(colors).map(([tag, color]) => {
      const tagObj: Partial<TagEntity> = { tag, color, user, server };
      return em.upsert(TagEntity, tagObj, {
        onConflictFields: ['tag', 'user', 'server'],
      });
    })));
  }

  private async resolveServerAndUser({ userId, serverPublicId }: FindTagsParam): Promise<ServerAndUserResult> {
    const [server, user] = await Promise.all([
      serverPublicId ? this.#serversService.getByPublicIdAndUser(serverPublicId, userId) : null,
      this.#em.findOne(UserEntity, { id: userId }),
    ]);

    return { server, user };
  }
}
