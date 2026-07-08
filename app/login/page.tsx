import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/server";
import { LoginButtons } from "./LoginButtons";
import styles from "./login.module.css";


// Bounces signed in users back to statistics page
export default async function LoginPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, } = await supabase.auth.getUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.card}>
        <h1 className={styles.title} lang="ja">
          <span className={styles.accented}>ば</span>か<span className={styles.accented}>読</span>め
          {/* TODO : Add a horizontal span under here, mimicking the spine logo */}
        </h1>
        <p className={styles.sub}>Sign in to track your immersion.</p>
        <LoginButtons />
      </div>
    </main>
  );
}
