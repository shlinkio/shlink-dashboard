import type { EntityManager } from '@mikro-orm/core';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import type { Migrator } from '@mikro-orm/migrations';
import type { NextFunction, Request, Response } from 'express';
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

export function createEntityManagerForkingMiddleware(em: EntityManager) {
  return (req: Request, res: Response, next: NextFunction) => {
    RequestContext.create(em, next);
  };
}
