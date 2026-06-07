import { useReducer, useState, type SubmitEventHandler } from "react";
import type { HeatmapMetric } from "./YearHeatmap";

export type LogSessionProps = {
  mode: string;
  isListening: boolean;
};

type LogEntry = {
  title: string;
  amount: number;
};

/** Per-field validation messages; a field is valid when its key is absent. */
type FieldErrors = {
  title?: string;
  amount?: string;
};

// Reducer state = the form values plus any active validation errors, so the UI
// renders messages from a single source of truth.
type LogState = LogEntry & {
  errors: FieldErrors;
};

type LogAction =
  | { type: "TITLE"; payload: string }
  | { type: "AMOUNT"; payload: string }
  | { type: "SET_ERRORS"; payload: FieldErrors };

const MAX_TITLE_LENGTH = 150;

const initialData: LogState = {
  title: "",
  amount: 0,
  errors: {},
};

const reducer = (state: LogState, action: LogAction): LogState => {
  switch (action.type) {
    case "AMOUNT": {
      const raw = action.payload;
      if (raw === "") {
        return { ...state, amount: 0, errors: { ...state.errors, amount: undefined } };
      }
      const amount = Number(raw);
      if (!Number.isInteger(amount) || amount < 0) {
        const message = "Enter a positive whole number.";
        return { ...state, errors: { ...state.errors, amount: message } };
      }
      return { ...state, amount, errors: { ...state.errors, amount: undefined } };
    }
    case "TITLE": {
      const title = action.payload;
      if (title.length > MAX_TITLE_LENGTH) {
        const message = `Keep the title under ${MAX_TITLE_LENGTH} characters.`;
        return { ...state, errors: { ...state.errors, title: message } };
      }
      // TODO we should be showing results from ranobedb api here...
      return { ...state, title, errors: { ...state.errors, title: undefined } };
    }
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    default:
      return state;
  }
};

export function LogSession({ mode, isListening }: LogSessionProps) {
  const [logUnit, setLogUnit] = useState<HeatmapMetric>("chars");
  const [formData, dispatch] = useReducer(reducer, initialData);

  const submitLog: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const { title, amount } = formData;

    const errors: FieldErrors = {};
    if (title.trim() === "") {
      // TODO update these error messages
      errors.title = "Enter what you've immersed in!";
    }

    if (amount <= 0) {
      const unit = isListening || logUnit === "minutes" ? "minutes" : "characters";
      errors.amount = `Enter how many ${unit} (greater than 0).`;
    }

    if (errors.title || errors.amount) {
      dispatch({ type: "SET_ERRORS", payload: errors });
      return;
    }

    const res = await fetch("/api/entries", {
      method: "POST",
      body: JSON.stringify({ amount, title }),
    });

    console.log(res);
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
      <form className="sa-log-form" onSubmit={submitLog} noValidate>
        <div className="sa-log-fields">
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
            aria-invalid={formData.errors.title ? true : undefined}
            aria-describedby={formData.errors.title ? "log-title-error" : undefined}
          />
          <input
            key={`amt-${mode}`}
            className="sa-log-amount"
            inputMode="numeric"
            value={formData.amount}
            onChange={(e) => dispatch({ type: "AMOUNT", payload: e.target.value })}
            aria-invalid={formData.errors.amount ? true : undefined}
            aria-describedby={formData.errors.amount ? "log-amount-error" : undefined}
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
                type="button"
                className={logUnit === "chars" ? "on" : ""}
                onClick={() => setLogUnit("chars")}
                title="Characters"
                lang="ja"
              >
                字
              </button>
              <button
                type="button"
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
        </div>
        {(formData.errors.title || formData.errors.amount) && (
          <div className="sa-log-errors" role="alert">
            {formData.errors.title && (
              <span id="log-title-error" className="sa-log-error">
                {formData.errors.title}
              </span>
            )}
            {formData.errors.amount && (
              <span id="log-amount-error" className="sa-log-error">
                {formData.errors.amount}
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
