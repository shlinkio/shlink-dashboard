import { z } from 'zod';

const supportedDbEngines = ['mysql', 'postgres', 'mariadb', 'sqlite', 'mssql'] as const;

export type DbEngine = typeof supportedDbEngines[number];

const envVariables = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).optional(),
  SHLINK_DASHBOARD_PORT: z.number().optional().default(3005),

  // Database connection options
  SHLINK_DASHBOARD_DB_DRIVER: z.enum(supportedDbEngines).optional(),
  SHLINK_DASHBOARD_DB_HOST: z.string().optional(),
  SHLINK_DASHBOARD_DB_PORT: z.string().transform(Number).optional(),
  SHLINK_DASHBOARD_DB_USER: z.string().optional(),
  SHLINK_DASHBOARD_DB_PASSWORD: z.string().optional(),
  SHLINK_DASHBOARD_DB_NAME: z.string().optional(),

  // Sessions
  SHLINK_DASHBOARD_SESSION_SECRETS: z.string().transform(
    // Split the comma-separated list of secrets
    (secrets) => secrets.split(',').map((v) => v.trim()),
  ).optional(),
});

export const env = envVariables.parse(process.env);

export const isProd = () => env.NODE_ENV === 'production';
