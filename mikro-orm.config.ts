import type { Options } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { Server } from './app/entities/Server';
import { Settings } from './app/entities/Settings';
import { Tag } from './app/entities/Tag';
import { User } from './app/entities/User';
import type { DbEngine } from './app/utils/env.server';
import { env, isProd } from './app/utils/env.server';

const DEFAULT_PORTS_MAP: Record<Exclude<DbEngine, 'sqlite'>, number> = {
  mysql: 3306,
  mariadb: 3306,
  postgres: 5432,
  mssql: 1433,
};

const DRIVER_MAP: Record<Exclude<DbEngine, 'sqlite'>, () => Promise<Options['driver']>> = {
  mysql: () => import('@mikro-orm/mysql').then(({ MySqlDriver }) => MySqlDriver),
  mariadb: () => import('@mikro-orm/mariadb').then(({ MariaDbDriver }) => MariaDbDriver),
  postgres: () => import('@mikro-orm/postgresql').then(({ PostgreSqlDriver }) => PostgreSqlDriver),
  mssql: () => import('@mikro-orm/mssql').then(({ MsSqlDriver }) => MsSqlDriver),
};

async function resolveOptions(): Promise<Options> {
  const commonOptions: Options = {
    entities: [User, Settings, Server, Tag],
    migrations: {
      path: 'build/db/migrations', // TODO
      pathTs: 'app/db/migrations',
      snapshot: false,
    },
    extensions: [Migrator],
    debug: !isProd(),
  };

  const type = env.SHLINK_DASHBOARD_DB_DRIVER ?? 'sqlite';
  if (type === 'sqlite') {
    return {
      ...commonOptions,
      driver: await import('@mikro-orm/better-sqlite').then(({ BetterSqliteDriver }) => BetterSqliteDriver),
      dbName: 'data/database.sqlite',
    };
  }

  const port = env.SHLINK_DASHBOARD_DB_PORT ?? DEFAULT_PORTS_MAP[type];
  const driver = await DRIVER_MAP[type]();
  return {
    ...commonOptions,
    driver,
    host: env.SHLINK_DASHBOARD_DB_HOST,
    port,
    user: env.SHLINK_DASHBOARD_DB_USER,
    password: env.SHLINK_DASHBOARD_DB_PASSWORD,
    dbName: env.SHLINK_DASHBOARD_DB_NAME ?? 'shlink_dashboard',
  };
}

export default await resolveOptions();
