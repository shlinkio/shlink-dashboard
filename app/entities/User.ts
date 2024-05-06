import { EntitySchema } from 'typeorm';
import type { Base } from './Base';
import { BaseColumnSchema } from './Base';

export type User = Base & {
  username: string;
  password: string;
  role: string;
};

export const UserEntity = new EntitySchema<User>({
  name: 'User',
  tableName: 'users',
  columns: {
    ...BaseColumnSchema,
    username: { type: 'varchar' },
    password: { type: 'varchar' },
    role: { type: 'varchar' },
  },
});
