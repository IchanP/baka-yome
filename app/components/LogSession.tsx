import { useEffect, useReducer, useState, type SubmitEventHandler } from "react";
import { mutate } from "swr";
import { ymd } from "../lib/format";
import {
  ImmersionKind,
  SOURCE_LABELS,
  sourcesForKind,
  type Entry,
  type Source,
} from "../lib/types";
import { useToast } from "../providers/ToastContext";
import { useUser } from "../providers/UserContext";
import { Select } from "./Select";
import type { Mode } from "../providers/ModeContext";
import styles from "./LogSession.module.css";

export type LogSessionProps = {
  mode: Mode;
};

type LogEntry = {
  title: string;
  amount: number;
};

type FieldErrors = {
  title?: string;
  amount?: string;
};

// Reducer state = the form values plus any active validation errors, so the UI
// renders messages from a single source of truth.
type LogState = LogEntry & {
  source: Source;
  errors: FieldErrors;
};

type LogAction =
  | { type: "TITLE"; payload: string }
  | { type: "AMOUNT"; payload: string }
  | { type: "SOURCE"; payload: Source }
  | { type: "SET_ERRORS"; payload: FieldErrors }
  | { type: "RESET" };

const MAX_TITLE_LENGTH = 150;

const initialData: LogState = {
  title: "",
  amount: 0,
  source: "novel",
  errors: {},
};

const reducer = (state: LogState, action: LogAction): LogState => {
  switch (action.type) {
    case "RESET":
      return { ...initialData, source: state.source };
    case "SOURCE":
      return { ...state, source: action.payload };
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
      // TODO we should be showing results from various API's here depending on the source.
      return { ...state, title, errors: { ...state.errors, title: undefined } };
    }
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    default:
      return state;
  }
};

export function LogSession({ mode }: LogSessionProps) {
  const [overallKind, setOverallKind] = useState<ImmersionKind>("reading");
  const [formData, dispatch] = useReducer(reducer, initialData);
  const toast = useToast();
  const user = useUser();

  let kind: ImmersionKind = overallKind;
  if (mode !== "overall") {
    kind = mode;
  }

  const isListeningKind = kind === "listening";

  let eyebrow = "Log session";
  let placeholder = "What did you read?";
  let unitTitle = "Characters";
  if (isListeningKind) {
    eyebrow = "Log listen";
    placeholder = "What did you watch or listen to? — title or link";
    unitTitle = "Minutes"
  }
  
  const sources = sourcesForKind(kind);
  
  useEffect(() => {
    dispatch({ type: "SOURCE", payload: sourcesForKind(kind)[0] });
  }, [kind]);


  const submitLog: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const { title, amount, source } = formData;

    let unit: "minutes" | "characters" = "characters";
    if (isListeningKind) {
      unit = "minutes";
    }

    const errors: FieldErrors = {};
    if (title.trim() === "") {
      // TODO update these error messages
      errors.title = "Enter what you've immersed in!";
    }

    if (amount <= 0) {
      errors.amount = `Enter how many ${unit} (greater than 0).`;
    }

    if (errors.title || errors.amount) {
      dispatch({ type: "SET_ERRORS", payload: errors });
      return;
    }

    let characters: number | null = null;
    let minutes: number | null = null;
    if (unit === "characters") {
      characters = amount;
    } else {
      minutes = amount;
    }

    // Optimistic row shown immediately. Gets replaced with the updatedCached after postEntry returns.
    const optimisticEntry: Entry = {
      id: crypto.randomUUID(),
      userId: user?.id ?? "",
      kind,
      source,
      title,
      occurredOn: ymd(new Date()),
      characters,
      minutes,
      createdAt: new Date().toISOString(),
    };

    const postEntry = async (current?: Entry[]): Promise<Entry[]> => {
      const res = await fetch("/api/entries", {
        method: "POST",
        // TODO occurredOn should be an option the user inputs at some point
        body: JSON.stringify({ kind, source, amount, unit, title, occurredOn: null }),
      });
      if (!res.ok) {
        throw new Error(String(res.status));
      }
      const { data } = (await res.json()) as { data: Entry };
      return [data, ...(current ?? [])];
    };

    try {
      await mutate<Entry[]>("/api/entries", postEntry, {
        optimisticData: (current?: Entry[]) => [optimisticEntry, ...(current ?? [])],
        rollbackOnError: true,
        revalidate: false, // TODO when adding an occuredOn entry for user this needs to be set to true as the date will be out of sync otherwise.
      });
      if (title) {
        toast.showSuccess("Log for " + title + " created. Good job!");
      } else {
        toast.showSuccess("Immersion log created. Good job!");
      }
      dispatch({ type: "RESET" });
    } catch (err) {
      if (err instanceof Error && err.message === "500") {
        toast.showError("An internal error occured. Log was not saved.");
      } else {
        toast.showError("Something went wrong. Please try logging again.");
      }
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.eyebrow}>{eyebrow}</div>
      <form className={styles.form} onSubmit={submitLog} noValidate>
        <div className={styles.fields}>
          {mode === "overall" && (
            <Select
              value={kind}
              options={[
                { value: "reading", label: "Reading" },
                { value: "listening", label: "Listening" },
              ]}
              onChange={(k) => setOverallKind(k)}
              ariaLabel="Reading or listening"
            />
          )}
          <input
            key={`title-${mode}`}
            className={styles.title}
            lang="ja"
            placeholder={placeholder}
            value={formData.title}
            onChange={(e) => dispatch({ type: "TITLE", payload: e.target.value })}
            aria-invalid={formData.errors.title ? true : undefined}
            aria-describedby={formData.errors.title ? "log-title-error" : undefined}
          />
          <Select
            value={formData.source}
            options={sources.map((s) => ({ value: s, label: SOURCE_LABELS[s] }))}
            onChange={(s) => dispatch({ type: "SOURCE", payload: s })}
            ariaLabel="Source type"
          />
          <input
            key={`amt-${mode}`}
            className={styles.amount}
            inputMode="numeric"
            value={formData.amount}
            onChange={(e) => dispatch({ type: "AMOUNT", payload: e.target.value })}
            aria-invalid={formData.errors.amount ? true : undefined}
            aria-describedby={formData.errors.amount ? "log-amount-error" : undefined}
          />
          <div className={styles.unit}>
            <span className={styles.unitStatic} title={unitTitle}>
              {unitTitle}
            </span>
          </div>
          <button className={styles.go} aria-label="Log session" type="submit">
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
          <div className={styles.errors} role="alert">
            {formData.errors.title && (
              <span id="log-title-error" className={styles.error}>
                {formData.errors.title}
              </span>
            )}
            {formData.errors.amount && (
              <span id="log-amount-error" className={styles.error}>
                {formData.errors.amount}
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
