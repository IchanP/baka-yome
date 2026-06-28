"use client";

import { useMode, type Mode } from "../providers/ModeContext";
import styles from "./ModeToggle.module.css";

const TABS: [Mode, string][] = [
  ["overall", "Overall"],
  ["reading", "Reading"],
  ["listening", "Listening"],
];

/**
 * Overall / reading / listening palette + data switch. Rendered into the
 * header via the @toolbar parallel-route slot, but reads/writes the shared
 * ModeContext so the page body and the [data-mode] theme stay in sync.
 *
 * Overall is the default and merges both streams; reading and listening filter.
 */
export function ModeToggle() {
  const { mode, setMode } = useMode();

  return (
    <div className={styles.mode} role="tablist" aria-label="Overall, reading or listening">
      {TABS.map(([value, label]) => (
        <button
          key={value}
          className={mode === value ? styles.on : ""}
          onClick={() => setMode(value)}
          aria-pressed={mode === value}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
