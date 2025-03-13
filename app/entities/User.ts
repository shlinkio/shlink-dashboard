import { EntitySchema } from '@mikro-orm/core';
import { UsersRepository } from '../users/UsersRepository.server';
import { BaseEntity, idColumnSchema } from './Base';

export const roles = ['admin', 'advanced-user', 'managed-user'] as const;

export type Role = typeof roles[number];

export class User extends BaseEntity {
  username!: string;
  password!: string;
  role!: Role;
  displayName!: string | null;
  createdAt!: Date;
}

export const UserSchema = new EntitySchema({
  class: User,
  tableName: 'users',
  repository: () => UsersRepository,
  properties: {
    id: idColumnSchema,
    username: { type: 'string', unique: true },
    password: { type: 'string' },
    role: {
      type: 'string',
      enum: true,
      items: [...roles],
    },
    displayName: {
      name: 'display_name',
      type: 'string',
      nullable: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'datetime',
      onCreate: () => new Date(),
    },
  },
});
