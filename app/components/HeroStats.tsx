import { useMemo } from "react";
import { fmtChars, fmtHours, fmtMinutes, fmtNum, ymd } from "../lib/format";
import type { SessionStream } from "../lib/stream";
import type { Mode } from "../providers/ModeContext";
import styles from "./HeroStats.module.css";

export type HeroStatsProps = {
  stream: SessionStream<unknown>;
  mode: Mode;
  reading: SessionStream<unknown>;
  listening: SessionStream<unknown>;
  isLoading?: boolean;
};

const STREAK_SUB: Record<Mode, string> = {
  overall: "keep both going today",
  reading: "read today to keep it going",
  listening: "listen today to keep it going",
};

type StatProps = {
  eyebrow: string;
  value?: string | number;
  unit?: string;
  sub?: string;
  accent?: boolean;
  className?: string;
  loading?: boolean;
};

function Stat({
  eyebrow,
  value,
  unit,
  sub,
  accent,
  className,
  loading,
}: StatProps) {
  let numClass = styles.statNum;
  if (accent) {
    numClass = `${styles.statNum} ${styles.accent}`;
  }
  let rootClass = styles.stat;
  if (className) {
    rootClass = `${styles.stat} ${className}`;
  }
  return (
    <div className={rootClass}>
      <div className={styles.statLabel}>
        <div className={styles.eyebrow}>{eyebrow}</div>
      </div>
      {loading ? (
        <>
          <div className={styles.statValue}>
            <span className={`${styles.bar} ${styles.barNum}`} />
          </div>
          <div className={styles.statSub}>
            <span className={`${styles.bar} ${styles.barSub}`} />
          </div>
        </>
      ) : (
        <>
          <div className={styles.statValue}>
            <span className={numClass}>{value}</span>
            {unit && <span className={styles.statUnit}>{unit}</span>}
          </div>
          <div className={styles.statSub}>{sub}</div>
        </>
      )}
    </div>
  );
}

export function HeroStats({
  stream,
  mode,
  reading,
  listening,
  isLoading,
}: HeroStatsProps) {
  const isReading = mode === "reading";
  const isOverall = mode === "overall";

  const weekSessionCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const entry = stream.byDate[ymd(d)];
      if (entry) {
        n += entry.sessions.length;
      }
    }
    return n;
  }, [stream]);

  if (isLoading) {
    if (isOverall) {
      return (
        <div className={`${styles.hero} ${styles.overall}`}>
          <Stat eyebrow="Total" loading />
          <Stat eyebrow="This week" loading />
          <Stat eyebrow="Streak" loading className={styles.streakStat} />
          <Stat eyebrow="Total" loading />
          <Stat eyebrow="This week" loading />
        </div>
      );
    }
    return (
      <div className={styles.hero}>
        <Stat eyebrow="Total" loading />
        <Stat eyebrow="Streak" loading />
        <Stat eyebrow="This week" loading />
      </div>
    );
  }

  if (isOverall) {
    return (
      <div className={`${styles.hero} ${styles.overall}`}>
        <Stat
          eyebrow="Total"
          value={fmtHours(listening.totals.minutes)}
          unit="hrs"
          sub="listening"
        />
        <Stat
          eyebrow="This week"
          value={fmtHours(listening.week.minutes)}
          unit="hrs"
          sub="listening"
        />
        <Stat
          eyebrow="Streak"
          value={stream.streak}
          unit="days"
          sub={STREAK_SUB.overall}
          accent
          className={styles.streakStat}
        />
        <Stat
          eyebrow="Total"
          value={fmtChars(reading.totals.chars)}
          unit="chars"
          sub="reading"
        />
        <Stat
          eyebrow="This week"
          value={fmtChars(reading.week.chars)}
          unit="chars"
          sub="reading"
        />
      </div>
    );
  }

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
    if (weekSessionCount === 1) {
      label = "session";
    }
    weekSub = `${weekSessionCount} ${label} across 7 days`;
  }

  return (
    <div className={styles.hero}>
      <Stat eyebrow="Total" value={totalValue} unit={totalUnit} sub={totalSub} />
      <Stat
        eyebrow="Streak"
        value={stream.streak}
        unit="days"
        sub={STREAK_SUB[mode]}
        accent
      />
      <Stat
        eyebrow="This week"
        value={fmtMinutes(stream.week.minutes)}
        sub={weekSub}
      />
    </div>
  );
}
