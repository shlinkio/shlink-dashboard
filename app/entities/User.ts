import { EntitySchema } from '@mikro-orm/core';
import { BaseEntity, idColumnSchema } from './Base';

export class User extends BaseEntity {
  username!: string;
  password!: string;
  role!: string;
}

export const UserSchema = new EntitySchema({
  class: User,
  tableName: 'users',
  properties: {
    id: idColumnSchema,
    username: { type: 'string' },
    password: { type: 'string' },
    role: { type: 'string' },
  },
});
