import { createContext, useContext, type ReactNode } from 'react';

// Global app context — per CPO guide: "Keep app state in a single
// ContextProvider (matches src/utils/ContextProvider.tsx)".
//
// AUTH: vibe-coding rule says no auth in the prototype. Hardcode a
// mock user so useCurrentUser() has the same shape it'll have after
// porting into the main frontend (where Apollo's setContext link
// pulls from a Supabase session).
//
// When this code ports into frontend/src/, replace mockUser with the
// real session-backed user and delete the mock. Components that call
// useCurrentUser() don't change.

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: 'pm' | 'sales' | 'ops' | 'dev';
}

const mockUser: CurrentUser = {
  id: 'dev-user',
  email: 'dylan@agriprove.io',
  name: 'Dylan Cronje',
  role: 'pm',
};

interface AppContextValue {
  currentUser: CurrentUser;
}

const AppContext = createContext<AppContextValue | null>(null);

export function ContextProvider({ children }: { children: ReactNode }) {
  const value: AppContextValue = {
    currentUser: mockUser,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside ContextProvider');
  return ctx;
}

export function useCurrentUser(): CurrentUser {
  return useAppContext().currentUser;
}
