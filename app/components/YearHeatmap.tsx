"use client";

import { Fragment, useMemo } from "react";
import { fmtChars, fmtMinutes, fmtNum, MONTHS_EN, ymd } from "../lib/format";
import styles from "./YearHeatmap.module.css";

export type HeatmapMetric = "chars" | "minutes" | "overall";

export type HeatmapDay = {
  chars: number;
  minutes: number;
};

export type YearHeatmapProps = {
  year: number;
  onYearChange: (year: number) => void;
  byDate: Record<string, HeatmapDay>;
  metric: HeatmapMetric;
  /** Tooltip text for days with no activity (e.g. "no reading", "no listening"). */
  emptyDayLabel: string;
  /** Past-tense verb used in the foot summary (e.g. "read", "listened"). */
  activityVerbPast: string;
};

const DOW_JA = ["日", "月", "火", "水", "木", "金", "土"];

// The 5-stop intensity ramp lives in CSS (--heat-0..--heat-4) and swaps
// with [data-mode]. The component just references the variables by index.
const HEAT_VARS = [
  "var(--heat-0)",
  "var(--heat-1)",
  "var(--heat-2)",
  "var(--heat-3)",
  "var(--heat-4)",
] as const;

type YearCell = {
  date: string;
  day: number;
  month: number;
  inYear: boolean;
  isFuture: boolean;
  isToday: boolean;
};

type YearGrid = {
  weeks: YearCell[][];
  monthSpans: { month: number; startWeek: number }[];
};

function getYearGrid(year: number, now: Date = new Date()): YearGrid {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const start = new Date(year, 0, 1);
  while (start.getDay() !== 0) {start.setDate(start.getDate() - 1);}
  const end = new Date(year, 11, 31);
  while (end.getDay() !== 6) {end.setDate(end.getDate() + 1);}

  const weeks: YearCell[][] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const week: YearCell[] = [];
    for (let i = 0; i < 7; i++) {
      week.push({
        date: ymd(cursor),
        day: cursor.getDate(),
        month: cursor.getMonth(),
        inYear: cursor.getFullYear() === year,
        isFuture: cursor.getTime() > today.getTime(),
        isToday: cursor.getTime() === today.getTime(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const monthSpans: { month: number; startWeek: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstInYear = week.find((d) => d.inYear);
    if (!firstInYear) {return;}
    if (firstInYear.month !== lastMonth) {
      monthSpans.push({ month: firstInYear.month, startWeek: weekIndex });
      lastMonth = firstInYear.month;
    }
  });

  return { weeks, monthSpans };
}

function intensityBucket(value: number, metric: "chars" | "minutes"): number {
  if (!value) {return 0;}
  
  if (metric === "chars") {
    if (value < 2500) {return 1;}
    if (value < 7000) {return 2;}
    if (value < 14000) {return 3;}
    return 4;
  }

  if (value < 20) {return 1;}
  if (value < 45) {return 2;}
  if (value < 80) {return 3;}
  return 4;
}

// Used for overall comparison across both reading and listening.
function bucketFor(metric: HeatmapMetric, chars: number, minutes: number): number {
  if (metric === "chars") {
    return intensityBucket(chars, "chars");
  }
  if (metric === "minutes") {
    return intensityBucket(minutes, "minutes");
  }
  return Math.min(
    4,
    intensityBucket(chars, "chars") + intensityBucket(minutes, "minutes"),
  );
}

function rankValue(
  metric: HeatmapMetric,
  chars: number,
  minutes: number,
  intensity: number,
): number {
  if (metric === "chars") {
    return chars;
  }
  if (metric === "minutes") {
    return minutes;
  }
  // Overall uses intensity
  return intensity;
}

function describeDay(
  metric: HeatmapMetric,
  chars: number,
  minutes: number,
): string {
  if (metric === "chars") {
    return `${fmtNum(chars)} chars`;
  }
  if (metric === "minutes") {
    return `${minutes} min`;
  }
  const parts: string[] = [];
  if (chars > 0) {
    parts.push(`${fmtNum(chars)} chars`);
  }
  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }
  return parts.join(" · ");
}

export function YearHeatmap({
  year,
  onYearChange,
  byDate,
  metric,
  emptyDayLabel,
  activityVerbPast,
}: YearHeatmapProps) {
  const currentYear = new Date().getFullYear();

  const yearGrid = useMemo(() => getYearGrid(year), [year]);

  const populatedWeeks = useMemo(
    () =>
      yearGrid.weeks.map((week) =>
        week.map((cell) => {
          const day = byDate[cell.date];
          let chars = 0;
          let minutes = 0;
          if (day) {
            chars = day.chars;
            minutes = day.minutes;
          }
          const intensity = bucketFor(metric, chars, minutes);
          const rank = rankValue(metric, chars, minutes, intensity);
          return { ...cell, chars, minutes, intensity, rank };
        }),
      ),
    [yearGrid, byDate, metric],
  );

  const yearStats = useMemo(() => {
    let activeDays = 0;
    let pastDays = 0;
    let totalChars = 0;
    let totalMinutes = 0;
    let bestRank = 0;
    let bestDate = "";
    let bestChars = 0;
    let bestMinutes = 0;

    populatedWeeks.forEach((week) =>
      week.forEach((cell) => {
        if (!cell.inYear || cell.isFuture) {return;}
        pastDays++;
        if (cell.intensity > 0) {activeDays++;}
        totalChars += cell.chars;
        totalMinutes += cell.minutes;
        if (cell.rank > bestRank) {
          bestRank = cell.rank;
          bestDate = cell.date;
          bestChars = cell.chars;
          bestMinutes = cell.minutes;
        }
      }),
    );

    return {
      activeDays,
      pastDays,
      totalChars,
      totalMinutes,
      bestDate,
      bestChars,
      bestMinutes,
    };
  }, [populatedWeeks]);

  let metricLabel;
  switch( metric ) {
    case "chars":
      metricLabel = "Characters";
      break;
    case "minutes":
      metricLabel = "Minutes";
      break;
    case "overall":
      metricLabel = "Overall";  
  }

  let summaryText = fmtMinutes(yearStats.totalMinutes);
  if (metric === "chars") {
    summaryText = `${fmtChars(yearStats.totalChars)} chars`;
  } else if (metric === "overall") {
    summaryText = `${fmtChars(yearStats.totalChars)} chars · ${fmtMinutes(
      yearStats.totalMinutes,
    )}`;
  }

  const nudgeYear = (delta: number) => onYearChange(year + delta);

  return (
    <div className="sa-card">
      <div className={styles.calHead}>
        <div className={styles.yearNav}>
          <button
            className={styles.iconbtn}
            onClick={() => nudgeYear(-1)}
            aria-label="Previous year"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M7 2L3 5.5 7 9" />
            </svg>
          </button>
          <h2>{year}</h2>
          <button
            className={styles.iconbtn}
            onClick={() => nudgeYear(1)}
            disabled={year >= currentYear}
            aria-label="Next year"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 11 11"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            >
              <path d="M4 2l4 3.5L4 9" />
            </svg>
          </button>
          <span className={styles.yearSummary}>
            <span className={styles.num}>{yearStats.activeDays}</span> days ·{" "}
            {summaryText}
          </span>
        </div>

        <div className={styles.metric} style={{ pointerEvents: "none" }}>
          <button className={styles.on}>{metricLabel}</button>
        </div>
      </div>

      <div className={styles.calBody}>
        <div
          className={styles.yh}
          style={{
            gridTemplateColumns: `auto repeat(${populatedWeeks.length}, minmax(11px, 1fr))`,
          }}
        >
          <div />
          {populatedWeeks.map((_, weekIndex) => {
            const span = yearGrid.monthSpans.find(
              (s) => s.startWeek === weekIndex,
            );
            return (
              <div key={`m${weekIndex}`} className={styles.yhMonth}>
                {span ? MONTHS_EN[span.month].slice(0, 3) : ""}
              </div>
            );
          })}

          {DOW_JA.map((dow, dayIdx) => (
            <Fragment key={`r${dayIdx}`}>
              <div className={styles.yhDow} lang="ja">
                {dow}
              </div>
              {populatedWeeks.map((week, weekIndex) => {
                const cell = week[dayIdx];
                const className = [
                  styles.yhCell,
                  !cell.inYear ? styles.out : "",
                  cell.intensity > 0 && !cell.isFuture ? styles.has : "",
                  cell.isFuture ? styles.future : "",
                  cell.isToday ? styles.today : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                let title = "";
                if (cell.inYear) {
                  let desc = emptyDayLabel;
                  if (cell.intensity > 0) {
                    desc = describeDay(metric, cell.chars, cell.minutes);
                  }
                  title = `${cell.date} · ${desc}`;
                }
                return (
                  <div
                    key={`c${dayIdx}-${weekIndex}`}
                    className={className}
                    title={title}
                    style={{
                      background:
                        cell.inYear && !cell.isFuture
                          ? HEAT_VARS[cell.intensity]
                          : undefined,
                    }}
                  />
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      <div className={styles.calFoot}>
        <span>
          <span className={styles.num}>{yearStats.activeDays}</span> /{" "}
          {yearStats.pastDays} days {activityVerbPast} this year
          {yearStats.bestDate && (
            <>
              {" · best day: "}
              <span className={styles.num}>
                {yearStats.bestDate.slice(5)} (
                {describeDay(metric, yearStats.bestChars, yearStats.bestMinutes)}
                )
              </span>
            </>
          )}
        </span>
        <span className={styles.legend}>
          Less
          <span className={styles.legendCells}>
            {HEAT_VARS.map((v, i) => (
              <div key={i} style={{ background: v }} />
            ))}
          </span>
          More
        </span>
      </div>
    </div>
  );
}
