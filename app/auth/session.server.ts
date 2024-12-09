import { createCookieSessionStorage } from 'react-router';
import { env, isProd } from '../utils/env.server';
import type { SessionData } from './session-context';

export const createSessionStorage = () => createCookieSessionStorage<{ sessionData: SessionData }>({
  cookie: {
    name: 'shlink_dashboard_session',
    httpOnly: true,
    maxAge: 30 * 60, // 30 minutes
    path: '/',
    sameSite: 'lax',
    secrets: env.SHLINK_DASHBOARD_SESSION_SECRETS ?? ['s3cr3t1'],
    secure: isProd(),
  },
});

export type SessionStorage = ReturnType<typeof createSessionStorage>;
