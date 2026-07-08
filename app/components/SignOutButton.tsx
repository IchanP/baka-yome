import styles from "./SignOutButton.module.css";

// A plain form POST to the server sign-out route — works without JS and keeps
// the session owned by the server.
export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className={styles.button}>
        Sign out
      </button>
    </form>
  );
}
