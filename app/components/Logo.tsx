import styles from "./Logo.module.css";

export function Logo() {
  return (
    <div className={styles.logo}>
      <div className={styles.spine} lang="ja">
        ばか読め
      </div>
    </div>
  );
}
