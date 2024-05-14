import { createCookieSessionStorage } from '@remix-run/node';
import { env, isProd } from '../utils/env.server';

export type SessionData = {
  userId: string;
};

export const createSessionStorage = () => createCookieSessionStorage<SessionData>({
  cookie: {
    name: '__shlink_dashboard_session',
    httpOnly: true,
    maxAge: 30 * 60, // 30 minutes
    path: '/',
    sameSite: 'lax',
    secrets: env.SHLINK_DASHBOARD_SESSION_SECRETS ?? ['s3cr3t1'],
    secure: isProd(),
  },
});

export type SessionStorage = ReturnType<typeof createSessionStorage>;
