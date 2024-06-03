import type { EntityManager } from '@mikro-orm/core';
import { MikroORM, RequestContext } from '@mikro-orm/core';
import type { NextFunction, Request, Response } from 'express';
import config from '../../mikro-orm.config';

export function createEntityManager(): EntityManager {
  const { em } = MikroORM.initSync(config);
  return em;
}

export function createEntityManagerForkingMiddleware(em: EntityManager) {
  return (req: Request, res: Response, next: NextFunction) => {
    RequestContext.create(em, next);
  };
}
