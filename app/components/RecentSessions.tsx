import { coverFor } from "../lib/covers";
import { fmtChars, MONTHS_EN } from "../lib/format";
import type { ListeningSession, ReadingSession } from "../lib/mock-data";

type Session = ReadingSession | ListeningSession;

export type RecentSessionsProps = {
  sessions: Session[];
  isListening: boolean;
};

export function RecentSessions({ sessions, isListening }: RecentSessionsProps) {
  return (
    <div className="sa-card sa-sess-card">
      <div className="sa-sess-head">
        <h3>Recent sessions</h3>
        <span className="ja-eyebrow" lang="ja">
          最近
        </span>
      </div>
      <div className="sa-sess-list">
        {sessions.map((session, i) =>
          isListening ? (
            <ListeningRow key={i} session={session as ListeningSession} />
          ) : (
            <ReadingRow key={i} session={session as ReadingSession} />
          ),
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

/* TODO merge these into the same function later? */

function ReadingRow({ session }: { session: ReadingSession }) {
  return (
    <div className="sa-sess-row">
      <CoverThumb title={session.title} />
      <div style={{ minWidth: 0 }}>
        <div className="sa-sess-title" lang="ja">
          {session.title}
        </div>
        <div className="sa-sess-meta">
          {dateLabel(session.date)} · {session.type} ·{" "}
          <span lang="ja">{session.author}</span>
        </div>
      </div>
      <div className="sa-sess-val">
        <div className="sa-sess-chars">
          {fmtChars(session.chars)}{" "}
          <span className="unit" lang="ja">
            字
          </span>
        </div>
        <div className="sa-sess-mins">{session.minutes}m</div>
      </div>
    </div>
  );
}

function ListeningRow({ session }: { session: ListeningSession }) {
  return (
    <div className="sa-sess-row">
      <CoverThumb title={session.title} />
      <div style={{ minWidth: 0 }}>
        <div className="sa-sess-title" lang="ja">
          {session.title}
        </div>
        <div className="sa-sess-meta">
          {dateLabel(session.date)} · {session.type} ·{" "}
          <span lang="ja">{session.link || session.author}</span>
        </div>
      </div>
      <div className="sa-sess-val">
        <div className="sa-sess-chars">
          {session.minutes}{" "}
          <span className="unit" lang="ja">
            分
          </span>
        </div>
        <div className="sa-sess-mins">{(session.minutes / 60).toFixed(1)}h</div>
      </div>
    </div>
  );
}
