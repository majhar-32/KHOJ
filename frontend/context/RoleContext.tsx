"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Role } from "@/lib/types";

interface RoleContextValue {
  role: Role;
  setRole: (role: Role) => void;
}

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

/**
 * DEV-ONLY role switcher context.
 * There is no real authentication yet — this exists purely so every
 * screen can be previewed as User / Organizer / Admin during the
 * frontend-first build. Replace with real auth state once the
 * backend exists.
 */
export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>("user");
  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole(): RoleContextValue {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
