"use client";

import { useMemo, useState } from "react";
import { YearHeatmap, type HeatmapMetric } from "./components/YearHeatmap";
import { coverFor } from "./lib/covers";
import {
  fmtChars,
  fmtHours,
  fmtMinutes,
  fmtNum,
  MONTHS_EN,
  ymd,
} from "./lib/format";
import {
  LISTENING_DATA,
  READING_DATA,
  type ListeningSession,
  type ReadingSession,
} from "./lib/mock-data";

type Mode = "reading" | "listening";

export default function StatisticsPage() {
  const [mode, setMode] = useState<Mode>("reading");
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [readingMetric, setReadingMetric] = useState<HeatmapMetric>("chars");
  const [logUnit, setLogUnit] = useState<HeatmapMetric>("chars");

  const isListening = mode === "listening";
  const stream = isListening ? LISTENING_DATA : READING_DATA;

  // Listening has no character count — its heatmap is always minutes.
  const heatmapMetric: HeatmapMetric = isListening ? "minutes" : readingMetric;

  const recentSessions = useMemo(
    () =>
      [...stream.sessions]
        .sort((a, b) => (a.date < b.date ? 1 : -1))
        .slice(0, 8),
    [stream],
  );

  const weekSessionCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const entry = stream.byDate[ymd(d)];
      if (entry) n += entry.sessions.length;
    }
    return n;
  }, [stream]);

  return (
    <main className="sa-root flex-1" data-mode={mode}>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="sa-header">
        <div className="sa-logo">
          <div className="sa-logo-spine" lang="ja">
            ばか読め
          </div>
        </div>
        <div
          className="sa-mode"
          role="tablist"
          aria-label="Reading or listening"
        >
          <button
            className={!isListening ? "on" : ""}
            onClick={() => setMode("reading")}
            aria-pressed={!isListening}
          >
            <span className="k" lang="ja">
              読
            </span>
            <span className="lbl">Reading</span>
          </button>
          <button
            className={isListening ? "on" : ""}
            onClick={() => setMode("listening")}
            aria-pressed={isListening}
          >
            <span className="k" lang="ja">
              聴
            </span>
            <span className="lbl">Listening</span>
          </button>
        </div>
        <div className="sa-nav">
          <span className="on">Stats</span>
          <span>Library</span>
          <span>Sessions</span>
        </div>
      </div>

      {/* ── Hero stats ──────────────────────────────────────── */}
      <div className="sa-hero">
        <div className="sa-stat">
          <div className="sa-stat-label">
            <div className="sa-eyebrow">
              Total
              <span className="ja" lang="ja">
                {isListening ? "総時間" : "総文字数"}
              </span>
            </div>
          </div>
          <div className="sa-stat-value">
            <span className="sa-stat-num">
              {isListening
                ? fmtHours(stream.totals.minutes)
                : fmtChars(stream.totals.chars)}
            </span>
            <span className="sa-stat-unit" lang="ja">
              {isListening ? "時間" : "字"}
            </span>
          </div>
          <div className="sa-stat-sub">
            {isListening
              ? `${Math.round(stream.totals.minutes / 60).toLocaleString("en-US")} hours all-time`
              : `${fmtNum(stream.totals.chars)} characters all-time`}
          </div>
        </div>
        <div className="sa-stat">
          <div className="sa-stat-label">
            <div className="sa-eyebrow">
              Streak
              <span className="ja" lang="ja">
                連続
              </span>
            </div>
          </div>
          <div className="sa-stat-value">
            <span className="sa-stat-num accent">{stream.streak}</span>
            <span className="sa-stat-unit">
              days · <span lang="ja">日</span>
            </span>
          </div>
          <div className="sa-stat-sub">
            {isListening
              ? "listen today to keep it going"
              : "read today to keep it going"}
          </div>
        </div>
        <div className="sa-stat">
          <div className="sa-stat-label">
            <div className="sa-eyebrow">
              This week
              <span className="ja" lang="ja">
                今週
              </span>
            </div>
          </div>
          <div className="sa-stat-value">
            <span className="sa-stat-num">
              {fmtMinutes(stream.week.minutes)}
            </span>
          </div>
          <div className="sa-stat-sub">
            {isListening
              ? `${weekSessionCount} session${weekSessionCount === 1 ? "" : "s"} across 7 days`
              : `${fmtChars(stream.week.chars)} chars across 7 days`}
          </div>
        </div>
      </div>

      {/* ── Body: heatmap + log (left col) · recent (right col) ── */}
      <div className="sa-body">
        <div className="sa-grid">
          <div className="sa-col-main">
            <YearHeatmap
              year={year}
              onYearChange={setYear}
              byDate={stream.byDate}
              metric={heatmapMetric}
              onMetricChange={setReadingMetric}
              showMetricToggle={!isListening}
              emptyDayLabel={isListening ? "no listening" : "no reading"}
              activityVerbPast={isListening ? "listened" : "read"}
            />

            {/* Minimal log row (stubbed — no persistence) */}
            <div className="sa-log-row">
              <div className="sa-log-eyebrow">
                {isListening ? "Log listen" : "Log session"}
                <span className="ja">
                  {" · "}
                  <span lang="ja">{isListening ? "視聴" : "記録"}</span>
                </span>
              </div>
              <div className="sa-log-fields">
                <input
                  key={`title-${mode}`}
                  className="sa-log-title"
                  defaultValue={isListening ? "呪術廻戦" : "夜は短し歩けよ乙女"}
                  lang="ja"
                  placeholder={
                    isListening
                      ? "What did you watch or listen to? — title or link"
                      : "What did you read?"
                  }
                />
                <input
                  key={`amt-${mode}`}
                  className="sa-log-amount"
                  defaultValue={
                    isListening ? "48" : logUnit === "chars" ? "9,620" : "72"
                  }
                  inputMode="numeric"
                />
                {isListening ? (
                  <div className="sa-log-unit">
                    <span
                      className="sa-log-unit-static"
                      title="Minutes"
                      lang="ja"
                    >
                      分
                    </span>
                  </div>
                ) : (
                  <div className="sa-log-unit">
                    <button
                      className={logUnit === "chars" ? "on" : ""}
                      onClick={() => setLogUnit("chars")}
                      title="Characters"
                      lang="ja"
                    >
                      字
                    </button>
                    <button
                      className={logUnit === "minutes" ? "on" : ""}
                      onClick={() => setLogUnit("minutes")}
                      title="Minutes"
                      lang="ja"
                    >
                      分
                    </button>
                  </div>
                )}
                <button
                  className="sa-log-go"
                  aria-label="Log session"
                  onClick={() => {
                    /* stubbed — UI-only */
                  }}
                >
                  Log
                  <svg
                    width="11"
                    height="11"
                    viewBox="0 0 11 11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2 5.5h7M6.5 3l2.5 2.5L6.5 8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Recent sessions (right column on ≥760px, stacked below on mobile) */}
          <div className="sa-card sa-sess-card">
            <div className="sa-sess-head">
              <h3>Recent sessions</h3>
              <span className="ja-eyebrow" lang="ja">
                最近
              </span>
            </div>
            <div className="sa-sess-list">
              {recentSessions.map((session, i) =>
                isListening ? (
                  <ListeningRow key={i} session={session as ListeningSession} />
                ) : (
                  <ReadingRow key={i} session={session as ReadingSession} />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
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
