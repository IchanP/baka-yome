import { coverFor } from "../lib/covers";
import { fmtChars, MONTHS_EN } from "../lib/format";
import { SOURCE_LABELS, type Entry } from "../lib/types";
import styles from "./RecentSessions.module.css";

// Dot colours match the reading/listening accents in globals.css. They're
// hard-coded (not var(--accent)) because the overall view paints in the
// reading palette yet still needs the red dot for listening rows.
const KIND_HUE: Record<"reading" | "listening", string> = {
  reading: "#a380e5",
  listening: "#e0685c",
};

export type RecentSessionsProps = {
  sessions: Entry[];
  isOverall: boolean;
};

export function RecentSessions({ sessions, isOverall }: RecentSessionsProps) {
  return (
    <div className={`sa-card ${styles.sessCard}`}>
      <div className={styles.head}>
        <h3>Recent sessions</h3>
        {isOverall && <span className={styles.sub}>reading + listening</span>}
      </div>
      <div className={styles.list}>
        {sessions.map((session) => (
          <SessionRow key={session.id} session={session} showDot={isOverall} />
        ))}
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
  const minutes = session.minutes ?? 0;

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
            <div className={styles.mins}>{(minutes / 60).toFixed(1)}h</div>
          </>
        ) : (
          <>
            <div className={styles.chars}>
              {fmtChars(session.characters ?? 0)}{" "}
              <span className={styles.unit}>chars</span>
            </div>
            <div className={styles.mins}>{minutes}m</div>
          </>
        )}
      </div>
    </div>
  );
}
