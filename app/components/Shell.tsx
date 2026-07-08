"use client";

import { type ReactNode } from "react";
import { Logo } from "./Logo";
import { SignOutButton } from "./SignOutButton";
import { useMode } from "../providers/ModeContext";
import { useUser } from "../providers/UserContext";
import styles from "./Shell.module.css";

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
  const user = useUser();

  return (
    <main className="sa-root" data-mode={paletteMode}>
      <div className={styles.header}>
        <Logo />
        {toolbar}
        <div className={styles.actions}>
          <div className={styles.nav}>
            <span className={styles.on}>Stats</span>
            {/*           <span>Library</span>
            <span>Sessions</span> */}
          </div>
          {user && (
            <div className={styles.user}>
              {user.avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.avatar}
                  src={user.avatarUrl}
                  alt=""
                  width={24}
                  height={24}
                />
              )}
              {user.name && <span className={styles.name}>{user.name}</span>}
              <SignOutButton />
            </div>
          )}
        </div>
      </div>
      {children}
    </main>
  );
}
