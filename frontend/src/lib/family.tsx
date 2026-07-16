"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { FamilyMember } from "@/lib/api/types";
import { getFamilyMembers } from "@/lib/api/healthguard";
import { USE_MOCK_DATA } from "@/lib/api/client";

interface FamilyContextType {
  members: FamilyMember[];
  activeMember: FamilyMember | null;
  isLoading: boolean;
  setActiveMember: (m: FamilyMember) => void;
  refreshMembers: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [activeMember, setActiveMemberState] = useState<FamilyMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshMembers = async () => {
    if (USE_MOCK_DATA) return;
    setIsLoading(true);
    try {
      const data = await getFamilyMembers();
      setMembers(data);
      // Restore previously selected member or default to first
      setActiveMemberState((prev) => {
        if (prev) {
          const still = data.find((m) => m.id === prev.id);
          return still ?? data[0] ?? null;
        }
        return data[0] ?? null;
      });
    } catch {
      // silently ignore
    } finally {
      setIsLoading(false);
    }
  };

  const setActiveMember = (m: FamilyMember) => {
    setActiveMemberState(m);
  };

  useEffect(() => {
    refreshMembers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <FamilyContext.Provider value={{ members, activeMember, isLoading, setActiveMember, refreshMembers }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = (): FamilyContextType => {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error("useFamily must be used inside <FamilyProvider>");
  return ctx;
};
