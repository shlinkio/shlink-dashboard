import type { Settings as ShlinkWebComponentSettings } from '@shlinkio/shlink-web-component';
import { EntitySchema } from 'typeorm';
import type { Base } from './Base';
import { BaseColumnSchema } from './Base';
import type { User } from './User';
import { UserEntity } from './User';

export type Settings<T extends ShlinkWebComponentSettings = ShlinkWebComponentSettings> = Base & {
  user: User;
  settings: T;
};

export const SettingsEntity = new EntitySchema<Settings>({
  name: 'Settings',
  tableName: 'settings',
  columns: {
    ...BaseColumnSchema,
    settings: { type: 'json' },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: UserEntity,
      joinColumn: { name: 'user_id' },
    },
  },
});