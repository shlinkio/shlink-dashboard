import type { EntitySchemaProperty } from '@mikro-orm/core';

export class BaseEntity {
  id!: string; // FIXME This should be number, not string
}

export const idColumnSchema: EntitySchemaProperty<any, BaseEntity> = {
  type: 'int',
  primary: true,
  autoincrement: true,
  unsigned: true,
};
