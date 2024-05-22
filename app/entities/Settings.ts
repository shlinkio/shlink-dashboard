import type { Settings as ShlinkWebComponentSettings } from '@shlinkio/shlink-web-component/settings';
import { EntitySchema } from 'typeorm';
import type { Base } from './Base';
import { BaseColumnSchema } from './Base';
import type { User } from './User';
import { UserEntity } from './User';

export type Settings = Base & {
  user: User;
  settings: ShlinkWebComponentSettings;
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
      type: 'one-to-one',
      target: UserEntity,
      joinColumn: { name: 'user_id' },
    },
  },
});
