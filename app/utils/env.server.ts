import { z } from 'zod';

const envVariables = z.object({
  SHLINK_DASHBOARD_DB_DRIVER: z.string().optional(),
  SHLINK_DASHBOARD_DB_HOST: z.string().optional(),
  SHLINK_DASHBOARD_DB_PORT: z.string().optional(),
  SHLINK_DASHBOARD_DB_USER: z.string().optional(),
  SHLINK_DASHBOARD_DB_PASSWORD: z.string().optional(),
  SHLINK_DASHBOARD_DB_NAME: z.string().optional(),
});

export const env = envVariables.parse(process.env);
