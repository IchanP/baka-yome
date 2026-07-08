import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { LoginButtons } from "./LoginButtons";
import styles from "./login.module.css";

// Login gate. Middleware already redirects unauthenticated users here; this
// page also bounces already-signed-in users back to the app.
export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title} lang="ja">
          ばか読め
        </h1>
        <p className={styles.sub}>Sign in to track your immersion.</p>
        <LoginButtons />
      </div>
    </main>
  );
}
