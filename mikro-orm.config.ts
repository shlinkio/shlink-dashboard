import { BetterSqliteDriver } from '@mikro-orm/better-sqlite';
import type { Options } from '@mikro-orm/core';
import { MariaDbDriver } from '@mikro-orm/mariadb';
import { MsSqlDriver } from '@mikro-orm/mssql';
import { MySqlDriver } from '@mikro-orm/mysql';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
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

const DRIVER_MAP: Record<Exclude<DbEngine, 'sqlite'>, Options['driver']> = {
  mysql: MySqlDriver,
  mariadb: MariaDbDriver,
  postgres: PostgreSqlDriver,
  mssql: MsSqlDriver,
};

function resolveOptions(): Options {
  const commonOptions: Options = {
    entities: [User, Settings, Server, Tag],
    migrations: {
      path: '', // TODO
      pathTs: '', // TODO
    },
    debug: !isProd(),
  };

  const type = env.SHLINK_DASHBOARD_DB_DRIVER ?? 'sqlite';
  if (type === 'sqlite') {
    return {
      ...commonOptions,
      driver: BetterSqliteDriver,
      dbName: 'data/database.sqlite',
    };
  }

  const port = env.SHLINK_DASHBOARD_DB_PORT ?? DEFAULT_PORTS_MAP[type];
  const driver = DRIVER_MAP[type];
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

// eslint-disable-next-line no-restricted-exports
export default resolveOptions();
