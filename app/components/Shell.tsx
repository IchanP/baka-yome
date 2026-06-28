"use client";

import { type ReactNode } from "react";
import { Logo } from "./Logo";
import { useMode } from "../providers/ModeContext";

/**
 * App shell — owns the persistent header chrome (logo + nav) and the
 * [data-mode] palette switch that themes the whole page subtree.
 *
 * `toolbar` is a parallel-route slot: the contextual middle of the header
 * that each route fills in (or leaves empty via @toolbar/default.tsx).
 */
export function Shell({
  toolbar,
  children,
}: {
  toolbar: ReactNode;
  children: ReactNode;
}) {
  const { paletteMode } = useMode();

  return (
    <main className="sa-root flex-1" data-mode={paletteMode}>
      <div className="sa-header">
        <Logo />
        {toolbar}
        <div className="sa-nav">
          <span className="on">Stats</span>
          {/*           <span>Library</span>
          <span>Sessions</span> */}
        </div>
      </div>
      {children}
    </main>
  );
}
