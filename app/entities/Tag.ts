import { EntitySchema } from 'typeorm';
import type { Base } from './Base';
import { BaseColumnSchema } from './Base';
import type { User } from './User';
import { UserEntity } from './User';

export type Tag = Base & {
  tag: string;
  color: string;
  user: User;
};

export const TagEntity = new EntitySchema<Tag>({
  name: 'Tag',
  tableName: 'tags',
  columns: {
    ...BaseColumnSchema,
    color: { type: 'varchar' },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: UserEntity,
      joinColumn: { name: 'user_id' },
    },
  },
});
