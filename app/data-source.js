import 'reflect-metadata';
import { DataSource } from 'typeorm';

// TODO Fix types by validating driver
export const AppDataSource = new DataSource({
  type: process.env.SHLINK_DASHBOARD_DB_DRIVER,
  host: process.env.SHLINK_DASHBOARD_DB_HOST,
  port: Number(process.env.SHLINK_DASHBOARD_DB_PORT),
  username: process.env.SHLINK_DASHBOARD_DB_USER,
  password: process.env.SHLINK_DASHBOARD_DB_PASSWORD,
  database: process.env.SHLINK_DASHBOARD_DB_NAME,
  synchronize: false,
  logging: false,
  entities: [],
  migrations: [],
  subscribers: [],
});
