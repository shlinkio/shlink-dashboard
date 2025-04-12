import type { EntityManager } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import type { Migrator } from '@mikro-orm/migrations';
import config from '../../mikro-orm.config';

export function createORM(): MikroORM {
  return MikroORM.initSync(config);
}

export function createEntityManager({ em }: MikroORM): EntityManager {
  return em;
}

export function createMigrator(orm: MikroORM): Migrator {
  return orm.getMigrator();
}
