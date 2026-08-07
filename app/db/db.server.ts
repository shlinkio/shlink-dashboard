import type { EntityManager, IMigrator } from '@mikro-orm/core';
import { MikroORM } from '@mikro-orm/core';
import config from '../../mikro-orm.config';

export function createORM(): MikroORM {
  return new MikroORM(config);
}

export function createEntityManager({ em }: MikroORM): EntityManager {
  return em;
}

export function createMigrator(orm: MikroORM): IMigrator {
  return orm.migrator;
}
