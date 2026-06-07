import { useState } from "react";
import type { HeatmapMetric } from "./YearHeatmap";

export type LogSessionProps = {
  mode: string;
  isListening: boolean;
};

export function LogSession({ mode, isListening }: LogSessionProps) {
  const [logUnit, setLogUnit] = useState<HeatmapMetric>("chars");

  return (
    <div className="sa-log-row">
      <div className="sa-log-eyebrow">
        {isListening ? "Log listen" : "Log session"}
        <span className="ja">
          {" · "}
          <span lang="ja">{isListening ? "視聴" : "記録"}</span>
        </span>
      </div>
      <div className="sa-log-fields">
        <input
          key={`title-${mode}`}
          className="sa-log-title"
          defaultValue={isListening ? "呪術廻戦" : "夜は短し歩けよ乙女"}
          lang="ja"
          placeholder={
            isListening
              ? "What did you watch or listen to? — title or link"
              : "What did you read?"
          }
        />
        <input
          key={`amt-${mode}`}
          className="sa-log-amount"
          defaultValue={
            isListening ? "48" : logUnit === "chars" ? "9,620" : "72"
          }
          inputMode="numeric"
        />
        {isListening ? (
          <div className="sa-log-unit">
            <span className="sa-log-unit-static" title="Minutes" lang="ja">
              分
            </span>
          </div>
        ) : (
          <div className="sa-log-unit">
            <button
              className={logUnit === "chars" ? "on" : ""}
              onClick={() => setLogUnit("chars")}
              title="Characters"
              lang="ja"
            >
              字
            </button>
            <button
              className={logUnit === "minutes" ? "on" : ""}
              onClick={() => setLogUnit("minutes")}
              title="Minutes"
              lang="ja"
            >
              分
            </button>
          </div>
        )}
        <button
          className="sa-log-go"
          aria-label="Log session"
          onClick={() => {
            /* stubbed — UI-only */
          }}
        >
          Log
          <svg
            width="11"
            height="11"
            viewBox="0 0 11 11"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 5.5h7M6.5 3l2.5 2.5L6.5 8" />
          </svg>
        </button>
      </div>
    </div>
  );
}
