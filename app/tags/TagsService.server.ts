import type { EntityManager } from 'typeorm';
import { appDataSource } from '../db/data-source.server';
import type { Server } from '../entities/Server';
import { ServerEntity } from '../entities/Server';
import { TagEntity } from '../entities/Tag';
import type { User } from '../entities/User';
import { UserEntity } from '../entities/User';

export type FindTagsParam = {
  userId: number;
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
  constructor(private readonly em: EntityManager = appDataSource.manager) {
  }

  async tagColors(param: FindTagsParam): Promise<Record<string, string>> {
    const { server, user } = await this.resolveServerAndUser(param);
    if (!server || !user) {
      return {};
    }

    const tags = await this.em.find(TagEntity, {
      where: { user, server },
      order: { tag: 'ASC' },
    });

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

    const isMs = this.em.connection.options.type === 'mssql';
    await this.em.transaction((em): Promise<unknown> => {
      if (!isMs) {
        return em.upsert(
          TagEntity,
          Object.entries(colors).map(([tag, color]) => ({
            tag,
            color: color as string,
            user,
            server,
          })),
          ['tag', 'user', 'server'],
        );
      }

      // MS SQL Server does not support upsert
      return Promise.all(Object.entries(colors).map(async ([tag, color]) => {
        const tagEntity = await em.findOneBy(TagEntity, { user, server, tag }).then(
          // If a tag was not found, create it
          (result) => result ?? em.create(TagEntity, { user, server, tag, color }),
        );

        tagEntity.color = color;

        await em.save(tagEntity);
      }));
    });
  }

  private async resolveServerAndUser({ userId, serverPublicId }: FindTagsParam): Promise<ServerAndUserResult> {
    const [server, user] = await Promise.all([
      serverPublicId ? this.em.findOneBy(ServerEntity, { publicId: serverPublicId }) : null,
      this.em.findOneBy(UserEntity, { id: userId }),
    ]);

    return { server, user };
  }
}
