import { EntitySchema } from 'typeorm';
import type { Base } from './Base';
import { BaseColumnSchema } from './Base';
import type { User } from './User';
import { UserEntity } from './User';

export type Server = Base & {
  baseUrl: string;
  apiKey: string;
  publicId: string;
  name: string;
  users: User[];
};

export const ServerEntity = new EntitySchema<Server>({
  name: 'Server',
  tableName: 'servers',
  columns: {
    ...BaseColumnSchema,
    baseUrl: {
      type: 'varchar',
      name: 'base_url',
    },
    name: { type: 'varchar' },
    apiKey: {
      type: 'varchar',
      name: 'api_key',
    },
    publicId: {
      type: 'varchar',
      name: 'public_id',
      unique: true,
      generated: 'uuid',
    },
  },
  relations: {
    users: {
      type: 'many-to-many',
      target: UserEntity,
      joinTable: {
        name: 'user_has_servers',
        joinColumn: {
          name: 'server_id',
          referencedColumnName: 'id',
        },
        inverseJoinColumn: {
          name: 'user_id',
          referencedColumnName: 'id',
        },
      },
    },
  },
});
