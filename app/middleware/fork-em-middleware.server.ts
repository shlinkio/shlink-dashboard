import type { EntityManager } from '@mikro-orm/core';
import { RequestContext } from '@mikro-orm/core';
import type { MiddlewareFunction } from 'react-router';
import { serverContainer } from '../container/container.server';

export const forkEmMiddleware = async function(_args, next, em: EntityManager = serverContainer.em) {
  return RequestContext.create(em, next);
} satisfies MiddlewareFunction;
