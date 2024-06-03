import { EntitySchema, ReferenceKind } from '@mikro-orm/core';
import type { Settings as ShlinkWebComponentSettings } from '@shlinkio/shlink-web-component/settings';
import { BaseEntity, idColumnSchema } from './Base';
import { User } from './User';

export class Settings extends BaseEntity {
  user!: User;
  settings!: ShlinkWebComponentSettings;
}

export const SettingsSchema = new EntitySchema({
  class: Settings,
  tableName: 'settings',
  properties: {
    id: idColumnSchema,
    settings: {
      type: 'json',
    },
    user: {
      kind: ReferenceKind.ONE_TO_ONE,
      entity: () => User,
      joinColumn: 'user_id',
    },
  },
});
