import { createContext, useContext } from 'react';

export type SessionData = {
  userId: string;
  displayName: string | null;
};

export type ShlinkSessionData = {
  sessionData: SessionData;
  [key: string]: unknown;
};

const SessionContext = createContext<SessionData | null>(null);

export const { Provider: SessionProvider } = SessionContext;

export const useSession = () => useContext(SessionContext);
