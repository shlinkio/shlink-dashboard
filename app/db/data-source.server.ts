import 'reflect-metadata';
import { DataSource } from 'typeorm';
import type { DbEngine } from '../utils/env.server';
import { env } from '../utils/env.server';

function resolveTypeAndPort(): { type: DbEngine, port: number | undefined } {
  const DEFAULT_PORTS: Record<DbEngine, number | undefined> = {
    mysql: 3306,
    mariadb: 3306,
    postgres: 5432,
    mssql: 1433,
    sqlite: undefined,
  };
  const type = env.SHLINK_DASHBOARD_DB_DRIVER ?? 'mysql';
  const port = env.SHLINK_DASHBOARD_DB_PORT ?? DEFAULT_PORTS[type];

  return { type, port };
}

const { type, port } = resolveTypeAndPort();

export const AppDataSource = new DataSource({
  type,
  host: env.SHLINK_DASHBOARD_DB_HOST,
  port,
  username: env.SHLINK_DASHBOARD_DB_USER,
  password: env.SHLINK_DASHBOARD_DB_PASSWORD,
  database: env.SHLINK_DASHBOARD_DB_NAME ?? 'shlink-dashboard',
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
