import { coverFor } from "../lib/covers";
import { fmtChars, MONTHS_EN } from "../lib/format";
import { SOURCE_LABELS, type Entry } from "../lib/types";
import styles from "./RecentSessions.module.css";


// Dot color to make differentiating on overall page easier.
const KIND_HUE: Record<"reading" | "listening", string> = {
  reading: "#5aa2f0",
  listening: "#e0685c",
};

export type RecentSessionsProps = {
  sessions: Entry[];
  isOverall: boolean;
  isLoading: boolean;
};

export function RecentSessions({
  sessions,
  isOverall,
  isLoading,
}: RecentSessionsProps) {
  return (
    <div className={`sa-card ${styles.sessCard}`}>
      <div className={styles.head}>
        <h3>Recent sessions</h3>
        {isOverall && <span className={styles.sub}>Reading & Listening</span>}
      </div>
      <div className={styles.list}>
        {isLoading ? (
          <div
            className={styles.loader}
            role="status"
            aria-label="Loading sessions"
          >
            <span className={styles.spinner} />
          </div>
        ) : (
          sessions.map((session) => (
            <SessionRow key={session.id} session={session} showDot={isOverall} />
          ))
        )}
      </div>
    </div>
  );
}

function dateLabel(date: string): string {
  const [, m, d] = date.split("-");
  return `${MONTHS_EN[Number(m) - 1].slice(0, 3)} ${Number(d)}`;
}

function CoverThumb({ title }: { title: string }) {
  const cover = coverFor(title);
  return (
    <div
      className={styles.cover}
      style={{
        background: `linear-gradient(135deg, ${cover.bg1}, ${cover.bg2})`,
        color: cover.fg,
      }}
      lang="ja"
    >
      {title.slice(0, 3)}
    </div>
  );
}

function SessionRow({
  session,
  showDot,
}: {
  session: Entry;
  showDot: boolean;
}) {
  const isListening = session.kind === "listening";
  const title = session.title ?? "Untitled";
  const minutes = session.minutes;

  return (
    <div className={styles.row}>
      <CoverThumb title={title} />
      <div style={{ minWidth: 0 }}>
        <div className={styles.titlewrap}>
          {showDot && (
            <span
              className={styles.dot}
              style={{ background: KIND_HUE[session.kind] }}
              title={isListening ? "Listening" : "Reading"}
            />
          )}
          <span className={styles.title} lang="ja">
            {title}
          </span>
        </div>
        <div className={styles.meta}>
          {dateLabel(session.occurredOn)} · {SOURCE_LABELS[session.source]}
        </div>
      </div>
      <div className={styles.val}>
        {isListening ? (
          <>
            <div className={styles.chars}>
              {minutes} <span className={styles.unit}>min</span>
            </div>
          </>
        ) : (
          <>
           { !minutes ? (
              <div className={styles.chars}>
                {fmtChars(session.characters ?? 0)}{" "}
                <span className={styles.unit}>chars</span>
              </div> 
              ) : (
              <div className={styles.mins}>{minutes}m</div>
              ) 
            }
          </>
        )}
      </div>
    </div>
  );
}
