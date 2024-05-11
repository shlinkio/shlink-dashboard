import { z } from 'zod';

const supportedDbEngines = ['mysql', 'postgres', 'mariadb', 'sqlite', 'mssql'] as const;

export type DbEngine = typeof supportedDbEngines[number];

const envVariables = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).optional(),

  // Database connection options
  SHLINK_DASHBOARD_DB_DRIVER: z.enum(supportedDbEngines).optional(),
  SHLINK_DASHBOARD_DB_HOST: z.string().optional(),
  SHLINK_DASHBOARD_DB_PORT: z.string().transform(Number).optional(),
  SHLINK_DASHBOARD_DB_USER: z.string().optional(),
  SHLINK_DASHBOARD_DB_PASSWORD: z.string().optional(),
  SHLINK_DASHBOARD_DB_NAME: z.string().optional(),
});

export const env = envVariables.parse(process.env);

export const isProd = () => env.NODE_ENV === 'production';
