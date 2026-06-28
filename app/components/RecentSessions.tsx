import { coverFor } from "../lib/covers";
import { fmtChars, MONTHS_EN } from "../lib/format";
import type { TaggedSession } from "../lib/mock-data";

// Dot colours match the reading/listening accents in globals.css. They're
// hard-coded (not var(--accent)) because the overall view paints in the
// reading palette yet still needs the red dot for listening rows.
const KIND_HUE: Record<"reading" | "listening", string> = {
  reading: "#a380e5",
  listening: "#e0685c",
};

export type RecentSessionsProps = {
  sessions: TaggedSession[];
  isOverall: boolean;
};

export function RecentSessions({ sessions, isOverall }: RecentSessionsProps) {
  return (
    <div className="sa-card sa-sess-card">
      <div className="sa-sess-head">
        <h3>Recent sessions</h3>
        {isOverall && <span className="sa-sess-sub">reading + listening</span>}
      </div>
      <div className="sa-sess-list">
        {sessions.map((session, i) => (
          <SessionRow key={i} session={session} showDot={isOverall} />
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
      className="sa-sess-cover"
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
  session: TaggedSession;
  showDot: boolean;
}) {
  const isListening = session.kind === "listening";

  let meta = session.author;
  if (session.kind === "listening") {
    meta = session.link || session.author;
  }

  return (
    <div className="sa-sess-row">
      <CoverThumb title={session.title} />
      <div style={{ minWidth: 0 }}>
        <div className="sa-sess-titlewrap">
          {showDot && (
            <span
              className="sa-sess-dot"
              style={{ background: KIND_HUE[session.kind] }}
              title={isListening ? "Listening" : "Reading"}
            />
          )}
          <span className="sa-sess-title" lang="ja">
            {session.title}
          </span>
        </div>
        <div className="sa-sess-meta">
          {dateLabel(session.date)} · {session.type} ·{" "}
          <span lang="ja">{meta}</span>
        </div>
      </div>
      <div className="sa-sess-val">
        {session.kind === "listening" ? (
          <>
            <div className="sa-sess-chars">
              {session.minutes} <span className="unit">min</span>
            </div>
            <div className="sa-sess-mins">
              {(session.minutes / 60).toFixed(1)}h
            </div>
          </>
        ) : (
          <>
            <div className="sa-sess-chars">
              {fmtChars(session.chars)} <span className="unit">chars</span>
            </div>
            <div className="sa-sess-mins">{session.minutes}m</div>
          </>
        )}
      </div>
    </div>
  );
}
