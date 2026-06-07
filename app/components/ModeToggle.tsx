"use client";

import { useMode } from "../providers/ModeContext";

/**
 * Reading / listening palette + data switch. Rendered into the header via
 * the @toolbar parallel-route slot, but reads/writes the shared ModeContext
 * so the page body and the [data-mode] theme stay in sync.
 */
export function ModeToggle() {
  const { isListening, setMode } = useMode();

  return (
    <div className="sa-mode" role="tablist" aria-label="Reading or listening">
      <button
        className={!isListening ? "on" : ""}
        onClick={() => setMode("reading")}
        aria-pressed={!isListening}
      >
        <span className="k" lang="ja">
          読
        </span>
        <span className="lbl">Reading</span>
      </button>
      <button
        className={isListening ? "on" : ""}
        onClick={() => setMode("listening")}
        aria-pressed={isListening}
      >
        <span className="k" lang="ja">
          聴
        </span>
        <span className="lbl">Listening</span>
      </button>
    </div>
  );
}
