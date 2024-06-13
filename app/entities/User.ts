import { EntitySchema } from '@mikro-orm/core';
import { BaseEntity, idColumnSchema } from './Base';

export class User extends BaseEntity {
  username!: string;
  password!: string;
  role!: string;
  displayName!: string | null;
}

export const UserSchema = new EntitySchema({
  class: User,
  tableName: 'users',
  properties: {
    id: idColumnSchema,
    username: { type: 'string', unique: true },
    password: { type: 'string' },
    role: { type: 'string' },
    displayName: {
      name: 'display_name',
      type: 'string',
      nullable: true,
    },
  },
});
