"use client";

import { createContext, useContext } from "react";
import { canUseIam } from "@/lib/iam";

const UserAreaContext = createContext(null);

export function UserAreaProvider({ areaId, children }) {
  return (
    <UserAreaContext.Provider value={areaId}>
      {children}
    </UserAreaContext.Provider>
  );
}

export function useUserArea() {
  return { areaId: useContext(UserAreaContext) };
}

export function useCanUseIam(section, permission) {
  const { areaId } = useUserArea();
  return canUseIam(section, permission, areaId);
}
