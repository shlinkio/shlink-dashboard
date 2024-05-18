import { createContext, useContext } from 'react';

export type SessionData = {
  userId: number;
  [key: string]: unknown;
};

const SessionContext = createContext<SessionData | null>(null);

export const { Provider: SessionProvider } = SessionContext;

export const useSession = () => useContext(SessionContext);
