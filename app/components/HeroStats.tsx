import { useMemo } from "react";
import { fmtChars, fmtHours, fmtMinutes, fmtNum, ymd } from "../lib/format";
import type { SessionStream } from "../lib/mock-data";

export type HeroStatsProps = {
  stream: SessionStream<unknown>;
  isListening: boolean;
};

export function HeroStats({ stream, isListening }: HeroStatsProps) {
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
          <span className="sa-stat-num">{fmtMinutes(stream.week.minutes)}</span>
        </div>
        <div className="sa-stat-sub">
          {isListening
            ? `${weekSessionCount} session${weekSessionCount === 1 ? "" : "s"} across 7 days`
            : `${fmtChars(stream.week.chars)} chars across 7 days`}
        </div>
      </div>
    </div>
  );
}
