import { createCookieSessionStorage } from 'react-router';
import { env, isProd } from '../utils/env.server';
import type { ShlinkSessionData } from './session-context';

export const createSessionStorage = () => createCookieSessionStorage<ShlinkSessionData>({
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
