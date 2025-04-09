import { Collection, EntitySchema, ReferenceKind } from '@mikro-orm/core';
import { UsersRepository } from '../users/UsersRepository.server';
import { BaseEntity, idColumnSchema } from './Base';
import { Server } from './Server';

export const roles = ['admin', 'advanced-user', 'managed-user'] as const;

export type Role = typeof roles[number];

export class User extends BaseEntity {
  username!: string;
  password!: string;
  role!: Role;
  displayName!: string | null;
  createdAt!: Date;
  servers: Collection<Server>;

  constructor() {
    super();
    this.servers = new Collection<Server>(this);
  }
}

/**
 * A User object without the `servers` prop, which does not get serialized when streaming down to the browser
 */
export type PlainUser = Omit<User, 'servers'>;

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
    servers: {
      kind: ReferenceKind.MANY_TO_MANY,
      entity: () => Server,
      pivotTable: 'user_has_servers',
      joinColumn: 'user_id',
      inverseJoinColumn: 'server_id',
      mappedBy: 'users',
    },
  },
});
