"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/client";
import styles from "./login.module.css";

// Auth methods are modelled as a list so future providers (e.g. magic-link
// email) slot in as another entry rather than a restructure.
export function LoginButtons() {
  const [pending, setPending] = useState(false);

  const signInWithDiscord = async () => {
    setPending(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    // On success the browser is redirected to Discord; we only reach here on error.
    if (error) {
      setPending(false);
    }
  };

  return (
    <div className={styles.methods}>
      <button
        type="button"
        className={styles.discord}
        onClick={signInWithDiscord}
        disabled={pending}
      >
        {pending ? "Redirecting…" : "Sign in with Discord"}
      </button>
      {/* TODO: magic-link email form (signInWithOtp) goes here later. */}
    </div>
  );
}
