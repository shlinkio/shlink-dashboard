import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { env } from '../utils/env.server';

// TODO Fix types by validating driver
export const AppDataSource = new DataSource({
  type: (env.SHLINK_DASHBOARD_DB_DRIVER ?? 'mysql') as any,
  host: env.SHLINK_DASHBOARD_DB_HOST,
  port: Number(env.SHLINK_DASHBOARD_DB_PORT),
  username: env.SHLINK_DASHBOARD_DB_USER,
  password: env.SHLINK_DASHBOARD_DB_PASSWORD,
  database: env.SHLINK_DASHBOARD_DB_NAME,
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
