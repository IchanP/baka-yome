"use client";

export type ToastVariant = "error" | "success";

export type ToastData = {
  message: string;
  variant: ToastVariant;
};

type ToastProps = {
  toast: ToastData | null;
  onDismiss: () => void;
};

/**
 * Presentational toast host — a fixed region near the top of the screen that
 * renders the current toast (if any) as a colored panel sliding in from above:
 * red for errors, green for success.
 *
 * The region stays mounted so screen readers register it as a live region;
 * the panel inside is what mounts/unmounts. State + timing live in
 * <ToastProvider>; this component is purely visual.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  return (
    <div className="sa-toast-region" aria-live="assertive" aria-atomic="true">
      {toast && (
        <div className={`sa-toast sa-toast--${toast.variant}`} role="alert">
          <span className="sa-toast-msg">{toast.message}</span>
          <button
            type="button"
            className="sa-toast-close"
            aria-label="Dismiss"
            onClick={onDismiss}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
