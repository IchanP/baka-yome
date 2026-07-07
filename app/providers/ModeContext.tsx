"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Mode = "overall" | "reading" | "listening";

/** Which accent/heatmap palette the page paints in — one per mode. */
export type PaletteMode = "reading" | "listening" | "overall";

type ModeContextValue = {
  mode: Mode;
  setMode: (mode: Mode) => void;
  isOverall: boolean;
  isReading: boolean;
  isListening: boolean;
  /** Each mode paints in its own palette (overall = purple, reading = azure blue, listening = red). */
  paletteMode: PaletteMode;
};

const ModeContext = createContext<ModeContextValue | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("overall");
  return (
    <ModeContext.Provider
      value={{
        mode,
        setMode,
        isOverall: mode === "overall",
        isReading: mode === "reading",
        isListening: mode === "listening",
        paletteMode: mode,
      }}
    >
      {children}
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
