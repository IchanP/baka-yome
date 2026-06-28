import { useMemo } from "react";
import { fmtChars, fmtHours, fmtMinutes, fmtNum, ymd } from "../lib/format";
import type { SessionStream } from "../lib/mock-data";
import type { Mode } from "../providers/ModeContext";

export type HeroStatsProps = {
  stream: SessionStream<unknown>;
  mode: Mode;
};

// Streak caption per mode — overall nudges both streams at once.
const STREAK_SUB: Record<Mode, string> = {
  overall: "keep both going today",
  reading: "read today to keep it going",
  listening: "listen today to keep it going",
};

export function HeroStats({ stream, mode }: HeroStatsProps) {
  const isReading = mode === "reading";

  const weekSessionCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const entry = stream.byDate[ymd(d)];
      if (entry) {n += entry.sessions.length;}
    }
    return n;
  }, [stream]);

  // Reading leads with characters; overall + listening lead with hours.
  let totalValue = fmtHours(stream.totals.minutes);
  let totalUnit = "hrs";
  let totalSub = `${Math.round(stream.totals.minutes / 60).toLocaleString("en-US")} hours all-time`;
  if (isReading) {
    totalValue = fmtChars(stream.totals.chars);
    totalUnit = "chars";
    totalSub = `${fmtNum(stream.totals.chars)} characters all-time`;
  }

  let weekSub = `${fmtChars(stream.week.chars)} chars across 7 days`;
  if (!isReading) {
    let label = "sessions";
    if (weekSessionCount === 1) {label = "session";}
    weekSub = `${weekSessionCount} ${label} across 7 days`;
  }

  return (
    <div className="sa-hero">
      <div className="sa-stat">
        <div className="sa-stat-label">
          <div className="sa-eyebrow">Total</div>
        </div>
        <div className="sa-stat-value">
          <span className="sa-stat-num">{totalValue}</span>
          <span className="sa-stat-unit">{totalUnit}</span>
        </div>
        <div className="sa-stat-sub">{totalSub}</div>
      </div>
      <div className="sa-stat">
        <div className="sa-stat-label">
          <div className="sa-eyebrow">Streak</div>
        </div>
        <div className="sa-stat-value">
          <span className="sa-stat-num accent">{stream.streak}</span>
          <span className="sa-stat-unit">days</span>
        </div>
        <div className="sa-stat-sub">{STREAK_SUB[mode]}</div>
      </div>
      <div className="sa-stat">
        <div className="sa-stat-label">
          <div className="sa-eyebrow">This week</div>
        </div>
        <div className="sa-stat-value">
          <span className="sa-stat-num">{fmtMinutes(stream.week.minutes)}</span>
        </div>
        <div className="sa-stat-sub">{weekSub}</div>
      </div>
    </div>
  );
}
