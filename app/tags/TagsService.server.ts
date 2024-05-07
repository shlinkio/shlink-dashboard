import type { EntityManager } from 'typeorm';
import { appDataSource } from '../db/data-source.server';
import { ServerEntity } from '../entities/Server';
import { TagEntity } from '../entities/Tag';
import { UserEntity } from '../entities/User';

export type TagColorsParam = {
  userId: number;
  serverPublicId?: string;
};

export class TagsService {
  constructor(private readonly em: EntityManager = appDataSource.manager) {
  }

  async tagColors({ userId, serverPublicId }: TagColorsParam): Promise<Record<string, string>> {
    const [server, user] = await Promise.all([
      serverPublicId && this.em.findOneBy(ServerEntity, { publicId: serverPublicId }),
      this.em.findOneBy(UserEntity, { id: userId }),
    ]);

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
}
