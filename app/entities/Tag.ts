import { EntitySchema } from 'typeorm';
import type { Base } from './Base';
import { BaseColumnSchema } from './Base';
import type { Server } from './Server';
import { ServerEntity } from './Server';
import type { User } from './User';
import { UserEntity } from './User';

export type Tag = Base & {
  tag: string;
  color: string;
  user: User;
  server: Server;
};

export const TagEntity = new EntitySchema<Tag>({
  name: 'Tag',
  tableName: 'tags',
  columns: {
    ...BaseColumnSchema,
    tag: { type: 'varchar' },
    color: { type: 'varchar' },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: UserEntity,
      joinColumn: { name: 'user_id' },
    },
    server: {
      type: 'many-to-one',
      target: ServerEntity,
      joinColumn: { name: 'server_id' },
    },
  },
  indices: [
    {
      unique: true,
      columns: ['tag', 'user_id', 'server_id'],
    },
  ],
});
