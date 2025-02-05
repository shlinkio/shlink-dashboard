import { createContext, useContext } from 'react';
import type { Role } from '../entities/User';

export type SessionData = {
  userId: string;
  displayName: string | null;
  role: Role;
};

export type ShlinkSessionData = {
  sessionData: SessionData;
  [key: string]: unknown;
};

const SessionContext = createContext<SessionData | null>(null);

export const { Provider: SessionProvider } = SessionContext;

export const useSession = () => useContext(SessionContext);
