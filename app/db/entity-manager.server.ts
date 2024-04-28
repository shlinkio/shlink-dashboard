import type { EntityManager } from 'typeorm';
import { AppDataSource } from './data-source.server';

export async function getEm(): Promise<EntityManager> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return AppDataSource.manager;
}
