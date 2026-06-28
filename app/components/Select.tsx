"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import styles from "./Select.module.css";

export type SelectOption<T extends string> = {
  value: T;
  label: string;
};

type SelectProps<T extends string> = {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  ariaLabel?: string;
};

/**
 * Themeable single-select dropdown — a native <select> can't style its popup,
 * so this renders a button trigger plus a floating menu. Generic over the
 * option value type so it's reusable for any string-union choice.
 *
 * Keyboard: ↑/↓ move the highlight (and open when closed), Home/End jump to
 * the ends, Enter/Space commit the highlighted option, Escape closes.
 */
export function Select<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  // Highlighted (not yet committed) option while navigating by keyboard.
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const baseId = useId();

  const selected = options.find((o) => o.value === value);
  const selectedIndex = options.findIndex((o) => o.value === value);
  const optionId = (index: number) => `${baseId}-opt-${index}`;

  const openMenu = () => {
    setActiveIndex(selectedIndex === -1 ? 0 : selectedIndex);
    setOpen(true);
  };

  const commit = (option: SelectOption<T>) => {
    onChange(option.value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) {return;}
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {setOpen(false);}
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const onTriggerKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (open) {setActiveIndex((i) => Math.min(options.length - 1, i + 1));}
        else {openMenu();}
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) {setActiveIndex((i) => Math.max(0, i - 1));}
        else {openMenu();}
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActiveIndex(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        // Always handle these ourselves so the button's native click doesn't
        // also fire (which would toggle the menu out from under us).
        e.preventDefault();
        if (open) {
          const option = options[activeIndex];
          if (option) {commit(option);}
        } else {
          openMenu();
        }
        break;
    }
  };

  return (
    <div className={styles.select} data-open={open} ref={rootRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-activedescendant={
          open && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{selected?.label}</span>
        <svg
          className={styles.chevron}
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2.5 4L5 6.5 7.5 4" />
        </svg>
      </button>
      {open && (
        <div className={styles.menu} role="listbox" aria-label={ariaLabel}>
          {options.map((o, index) => (
            <button
              key={o.value}
              id={optionId(index)}
              type="button"
              role="option"
              aria-selected={o.value === value}
              className={[
                styles.option,
                o.value === value ? styles.on : "",
                index === activeIndex ? styles.active : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(o)}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
