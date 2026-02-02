import { z } from 'zod';

const supportedDbEngines = ['mysql', 'postgres', 'mariadb', 'sqlite', 'mssql'] as const;
const supportedRoles = ['admin', 'advanced-user', 'managed-user'] as const;

export type DbEngine = typeof supportedDbEngines[number];
export type Role = typeof supportedRoles[number];

const envVariables = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).optional(),

  // Database connection options
  SHLINK_DASHBOARD_DB_DRIVER: z.enum(supportedDbEngines).optional(),
  SHLINK_DASHBOARD_DB_HOST: z.string().optional(),
  SHLINK_DASHBOARD_DB_PORT: z.string().transform(Number).optional(),
  SHLINK_DASHBOARD_DB_USER: z.string().optional(),
  SHLINK_DASHBOARD_DB_PASSWORD: z.string().optional(),
  SHLINK_DASHBOARD_DB_NAME: z.string().optional(),
  SHLINK_DASHBOARD_DB_USE_ENCRYPTION: z.stringbool({ truthy: ['true'] }).optional(),

  // Sessions
  SHLINK_DASHBOARD_SESSION_SECRETS: z.string().transform(
    // Split the comma-separated list of secrets
    (secrets) => secrets.split(',').map((v) => v.trim()),
  ).optional(),

  // OIDC Configuration
  SHLINK_DASHBOARD_OIDC_ENABLED: z.stringbool({ truthy: ['true'] }).optional(),
  SHLINK_DASHBOARD_OIDC_ISSUER_URL: z.string().url().optional(),
  SHLINK_DASHBOARD_OIDC_CLIENT_ID: z.string().optional(),
  SHLINK_DASHBOARD_OIDC_CLIENT_SECRET: z.string().optional(),
  SHLINK_DASHBOARD_OIDC_REDIRECT_URI: z.string().url().optional(),
  SHLINK_DASHBOARD_OIDC_SCOPES: z.string().optional().default('openid profile email groups'),
  SHLINK_DASHBOARD_OIDC_ADMIN_GROUP: z.string().optional(),
  SHLINK_DASHBOARD_OIDC_ADVANCED_GROUP: z.string().optional(),
  SHLINK_DASHBOARD_OIDC_DEFAULT_ROLE: z.enum(supportedRoles).optional().default('managed-user'),
  SHLINK_DASHBOARD_OIDC_PROVIDER_NAME: z.string().optional().default('SSO'),
  SHLINK_DASHBOARD_LOCAL_AUTH_ENABLED: z.stringbool({ truthy: ['true'] }).optional().default(true),
});

export const env = envVariables.parse(process.env);

export const isProd = () => env.NODE_ENV === 'production';

export const isOidcEnabled = () => env.SHLINK_DASHBOARD_OIDC_ENABLED === true;

export const isLocalAuthEnabled = () => env.SHLINK_DASHBOARD_LOCAL_AUTH_ENABLED !== false;

export const getOidcProviderName = () => env.SHLINK_DASHBOARD_OIDC_PROVIDER_NAME ?? 'SSO';

export const getOidcConfig = () => {
  if (!isOidcEnabled()) {
    return null;
  }

  const issuerUrl = env.SHLINK_DASHBOARD_OIDC_ISSUER_URL;
  const clientId = env.SHLINK_DASHBOARD_OIDC_CLIENT_ID;
  const clientSecret = env.SHLINK_DASHBOARD_OIDC_CLIENT_SECRET;
  const redirectUri = env.SHLINK_DASHBOARD_OIDC_REDIRECT_URI;

  if (!issuerUrl || !clientId || !clientSecret || !redirectUri) {
    throw new Error(
      'OIDC is enabled but missing required configuration. ' +
      'Please set SHLINK_DASHBOARD_OIDC_ISSUER_URL, SHLINK_DASHBOARD_OIDC_CLIENT_ID, ' +
      'SHLINK_DASHBOARD_OIDC_CLIENT_SECRET, and SHLINK_DASHBOARD_OIDC_REDIRECT_URI.',
    );
  }

  return {
    issuerUrl,
    clientId,
    clientSecret,
    redirectUri,
    scopes: env.SHLINK_DASHBOARD_OIDC_SCOPES ?? 'openid profile email groups',
    adminGroup: env.SHLINK_DASHBOARD_OIDC_ADMIN_GROUP,
    advancedGroup: env.SHLINK_DASHBOARD_OIDC_ADVANCED_GROUP,
    defaultRole: env.SHLINK_DASHBOARD_OIDC_DEFAULT_ROLE ?? 'managed-user',
  };
};
