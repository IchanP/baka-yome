import { useState, useReducer, SubmitEventHandler } from "react";
import type { HeatmapMetric } from "./YearHeatmap";

export type LogSessionProps = {
  mode: string;
  isListening: boolean;
};

type LogEntry = {
  title: string;
  amount: number;
};

type FormEntries = "TITLE" | "AMOUNT";

type LogAction = { type: FormEntries; payload: string };

const initialData: LogEntry = {
  title: "",
  amount: 0,
};

const reducer = (state: LogEntry, action: LogAction) => {
  switch (action.type) {
    case "AMOUNT": {
      const payload = action.payload;
      if (payload === "") {
        return { ...state, amount: 0 };
      }
      const amount = Number(payload);
      if (!Number.isInteger(amount) || amount < 0) {
        return state;
      }
      return { ...state, amount };
    }
    case "TITLE":
      const title = action.payload;
      if (title.length < 150) {
        // TODO we should be showing results from ranobedb api here...
        return { ...state, title: action.payload };
      }
      // TODO display error
      return state;
    default:
      return state;
  }
};

export function LogSession({ mode, isListening }: LogSessionProps) {
  const [logUnit, setLogUnit] = useState<HeatmapMetric>("chars");
  /* TODO how do we use formData? */
  const [formData, dispatch] = useReducer(reducer, initialData);

  const submitLog = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { title, amount } = formData;
    if (amount <= 0) {
      // TODO Show error
      return;
    }
    if (title === "") {
      // TODO show error?
      return;
    }
    // Call API to submit entry...
  };

  return (
    <div className="sa-log-row">
      <div className="sa-log-eyebrow">
        {isListening ? "Log listen" : "Log session"}
        <span className="ja">
          {" · "}
          <span lang="ja">{isListening ? "視聴" : "記録"}</span>
        </span>
      </div>
      <form className="sa-log-fields" onSubmit={submitLog}>
        <input
          key={`title-${mode}`}
          className="sa-log-title"
          lang="ja"
          placeholder={
            isListening
              ? "What did you watch or listen to? — title or link"
              : "What did you read?"
          }
          value={formData.title}
          onChange={(e) => dispatch({ type: "TITLE", payload: e.target.value })}
        />
        <input
          key={`amt-${mode}`}
          className="sa-log-amount"
          inputMode="numeric"
          value={formData.amount}
          onChange={(e) =>
            dispatch({ type: "AMOUNT", payload: e.target.value })
          }
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
        <button className="sa-log-go" aria-label="Log session" type="submit">
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
      </form>
    </div>
  );
}
