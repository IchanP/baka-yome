"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Toast, type ToastData, type ToastVariant } from "../components/Toast";

type ToastContextValue = {
  /** Show a red error toast. Falls back to a generic message when none given. */
  showError: (message?: string) => void;
  /** Show a green success toast. Falls back to a generic message when none given. */
  showSuccess: (message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const DEFAULT_SUCCESS_MESSAGE = "Done!";
const AUTO_DISMISS_MS = 5000;

/**
 * Owns the single active toast plus its auto-dismiss timer, and renders the
 * <Toast> host. Any descendant can surface a message via useToast().
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const dismiss = useCallback(() => {
    clearTimer();
    setToast(null);
  }, [clearTimer]);

  const show = useCallback(
    (variant: ToastVariant, message: string) => {
      clearTimer();
      setToast({ variant, message });
      timer.current = setTimeout(() => setToast(null), AUTO_DISMISS_MS);
    },
    [clearTimer],
  );

  const showError = useCallback(
    (message: string = DEFAULT_ERROR_MESSAGE) => show("error", message),
    [show],
  );

  const showSuccess = useCallback(
    (message: string = DEFAULT_SUCCESS_MESSAGE) => show("success", message),
    [show],
  );

  // Don't leave a pending timer if the provider unmounts.
  useEffect(() => clearTimer, [clearTimer]);

  return (
    <ToastContext.Provider value={{ showError, showSuccess }}>
      {children}
      <Toast toast={toast} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}
