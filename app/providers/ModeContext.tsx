"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Mode = "reading" | "listening";

type ModeContextValue = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isListening: boolean;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("reading");
  return (
    <ModeContext.Provider
      value={{ mode, setMode, isListening: mode === "listening" }}
    >
      {children}move
    </ModeContext.Provider>
  );
}

export function useMode() {
  const ctx = useContext(ModeContext);
  if (!ctx) {
    throw new Error("useMode must be used within a <ModeProvider>");
  }
  return ctx;
}
