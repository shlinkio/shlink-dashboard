import type { Dictionary, Options } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';

/*
 * IMPORTANT! This file is deliberately decoupled from any of the server code, so that it can be used standalone
 */

type DbEngine = 'mysql' | 'postgres' | 'mariadb' | 'mssql';

const DEFAULT_PORTS_MAP: Record<DbEngine, number> = {
  mysql: 3306,
  mariadb: 3306,
  postgres: 5432,
  mssql: 1433,
};

const DRIVER_MAP: Record<DbEngine, () => Promise<Options['driver']>> = {
  mysql: () => import('@mikro-orm/mysql').then(({ MySqlDriver }) => MySqlDriver),
  mariadb: () => import('@mikro-orm/mariadb').then(({ MariaDbDriver }) => MariaDbDriver),
  postgres: () => import('@mikro-orm/postgresql').then(({ PostgreSqlDriver }) => PostgreSqlDriver),
  mssql: () => import('@mikro-orm/mssql').then(({ MsSqlDriver }) => MsSqlDriver),
};

const isProduction = process.env.NODE_ENV === 'production';

function resolveDriverOptions(): Dictionary {
  if (process.env.SHLINK_DASHBOARD_DB_USE_ENCRYPTION === 'true') {
    return { connection: { ssl: true } };
  }

  return {};
}

async function resolveOptions(): Promise<Options> {
  const commonOptions: Options = {
    migrations: {
      path: isProduction ? 'migrations' : 'app/db/migrations',
      snapshot: false,
    },
    extensions: [Migrator],
    discovery: {
      warnWhenNoEntities: false, // We don't need entities just to run migrations
    },
    driverOptions: resolveDriverOptions(),
  };

  const type = (process.env.SHLINK_DASHBOARD_DB_DRIVER ?? 'sqlite') as DbEngine | 'sqlite';
  if (type === 'sqlite') {
    return {
      ...commonOptions,
      driver: await import('@mikro-orm/better-sqlite').then(({ BetterSqliteDriver }) => BetterSqliteDriver),
      dbName: 'data/database.sqlite',
    };
  }

  const port = Number(process.env.SHLINK_DASHBOARD_DB_PORT ?? DEFAULT_PORTS_MAP[type]);
  const driver = await DRIVER_MAP[type]();
  return {
    ...commonOptions,
    driver,
    host: process.env.SHLINK_DASHBOARD_DB_HOST,
    port,
    user: process.env.SHLINK_DASHBOARD_DB_USER,
    password: process.env.SHLINK_DASHBOARD_DB_PASSWORD,
    dbName: process.env.SHLINK_DASHBOARD_DB_NAME ?? 'shlink_dashboard',
  };
}

export default await resolveOptions();
