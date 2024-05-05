import 'reflect-metadata';
import type { DataSourceOptions } from 'typeorm';
import { DataSource } from 'typeorm';
import type { DbEngine } from '../utils/env.server';
import { env } from '../utils/env.server';

const DEFAULT_PORTS: Record<Exclude<DbEngine, 'sqlite'>, number | undefined> = {
  mysql: 3306,
  mariadb: 3306,
  postgres: 5432,
  mssql: 1433,
};

function resolveOptions(): DataSourceOptions {
  const type = env.SHLINK_DASHBOARD_DB_DRIVER ?? 'sqlite';
  if (type === 'sqlite') {
    return {
      type,
      database: 'data/database.sqlite',
    };
  }

  const port = env.SHLINK_DASHBOARD_DB_PORT ?? DEFAULT_PORTS[type];
  return {
    type,
    host: env.SHLINK_DASHBOARD_DB_HOST,
    port,
    username: env.SHLINK_DASHBOARD_DB_USER,
    password: env.SHLINK_DASHBOARD_DB_PASSWORD,
    database: env.SHLINK_DASHBOARD_DB_NAME ?? 'shlink_dashboard',
    synchronize: false,
    logging: false,
    entities: [],
    migrations: ['app/db/migrations/*.ts'],
    subscribers: [],
  };
}

export const AppDataSource = new DataSource(resolveOptions());
