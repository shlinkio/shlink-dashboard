import type { EntitySchemaProperty } from '@mikro-orm/core';

export class BaseEntity {
  id!: string;
}

export const idColumnSchema: EntitySchemaProperty<any, BaseEntity> = {
  type: 'bigint',
  primary: true,
  autoincrement: true,
};
