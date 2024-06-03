import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { BaseEntity, idColumnSchema } from './Base';
import { Server } from './Server';
import { User } from './User';

export class Tag extends BaseEntity {
  tag!: string;
  color!: string;
  user!: User;
  server!: Server;
}

export const TagSchema = new EntitySchema({
  class: Tag,
  tableName: 'tags',
  properties: {
    id: idColumnSchema,
    tag: { type: 'string' },
    color: { type: 'string' },
    user: {
      kind: ReferenceKind.MANY_TO_ONE,
      entity: () => User,
      joinColumn: 'user_id',
    },
    server: {
      kind: ReferenceKind.MANY_TO_ONE,
      entity: () => Server,
      joinColumn: 'server_id',
    },
  },
  indexes: [
    {
      name: 'IDX_tag_user_server',
      properties: ['tag', 'user', 'server'],
      options: {
        unique: true,
      },
    },
  ],
});
