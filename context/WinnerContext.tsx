// context/WinnerContext.tsx
"use client";

import React, { createContext, ReactNode, useContext } from "react";
import { useRealtimeWinner } from "@/hooks/useRealtimeWinner";

type WinnerPayload = {
  giveaway_id: string;
  giveaway_title?: string | null;
  prize_name?: string | null;
  prize_image?: string | null;
  winner_id?: string | null;
  winner_name?: string | null;
  winner_email?: string | null;
  winner_phone?: string | null;
  announced_at?: string | null;
};

type WinnerContextType = {
  currentWinner: WinnerPayload | null;
  visible: boolean;
  setVisible: (v: boolean) => void;
  triggerLocal: (payload: WinnerPayload) => void;
};

const WinnerContext = createContext<WinnerContextType | undefined>(undefined);

export function WinnerProvider({ children }: { children: ReactNode }) {
  const { currentWinner, visible, setVisible, triggerLocal } = useRealtimeWinner();

  return (
    <WinnerContext.Provider value={{ currentWinner, visible, setVisible, triggerLocal }}>
      {children}
    </WinnerContext.Provider>
  );
}

export function useWinner() {
  const ctx = useContext(WinnerContext);
  if (!ctx) {
    throw new Error("useWinner must be used inside WinnerProvider");
  }
  return ctx;
}
