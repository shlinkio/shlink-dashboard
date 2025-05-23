import { createContext, useContext } from 'react';
import type { Role } from '../entities/User';

export type SessionData = {
  publicId: string;
  displayName: string | null;
  username: string;
  role: Role;
  tempPassword: boolean;
};

export type ShlinkSessionData = {
  sessionData: SessionData;
  [key: string]: unknown;
};

const SessionContext = createContext<SessionData | null>(null);

export const { Provider: SessionProvider } = SessionContext;

export const useSession = () => useContext(SessionContext);
