"use client";

import { createContext, useContext, type ReactNode } from "react";

// Minimal, serializable view of the signed-in user, hydrated once from the
// server in the root layout. Single source of truth for the id (LogSession)
// and the display name / avatar (Shell).
export type SessionUser = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

const UserContext = createContext<SessionUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): SessionUser | null {
  return useContext(UserContext);
}
