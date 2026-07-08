import styles from "./SignOutButton.module.css";

export function SignOutButton() {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className={styles.button}>
        Sign out
      </button>
    </form>
  );
}
