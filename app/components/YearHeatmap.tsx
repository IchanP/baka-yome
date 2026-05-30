"use client";

import { Fragment, useMemo } from "react";
import { fmtChars, fmtMinutes, fmtNum, MONTHS_EN, ymd } from "../lib/format";

export type HeatmapMetric = "chars" | "minutes";

export type HeatmapDay = {
  chars: number;
  minutes: number;
};

export type YearHeatmapProps = {
  year: number;
  onYearChange: (year: number) => void;
  byDate: Record<string, HeatmapDay>;
  metric: HeatmapMetric;
  onMetricChange: (metric: HeatmapMetric) => void;
  /** When false, the chars/minutes toggle is replaced with a static "minutes" label. */
  showMetricToggle: boolean;
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
  while (start.getDay() !== 0) start.setDate(start.getDate() - 1);
  const end = new Date(year, 11, 31);
  while (end.getDay() !== 6) end.setDate(end.getDate() + 1);

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
    if (!firstInYear) return;
    if (firstInYear.month !== lastMonth) {
      monthSpans.push({ month: firstInYear.month, startWeek: weekIndex });
      lastMonth = firstInYear.month;
    }
  });

  return { weeks, monthSpans };
}

function intensityBucket(value: number, metric: HeatmapMetric): number {
  if (!value) return 0;
  if (metric === "chars") {
    if (value < 2500) return 1;
    if (value < 7000) return 2;
    if (value < 14000) return 3;
    return 4;
  }
  if (value < 20) return 1;
  if (value < 45) return 2;
  if (value < 80) return 3;
  return 4;
}

export function YearHeatmap({
  year,
  onYearChange,
  byDate,
  metric,
  onMetricChange,
  showMetricToggle,
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
          const value = day ? (metric === "chars" ? day.chars : day.minutes) : 0;
          return {
            ...cell,
            value,
            intensity: intensityBucket(value, metric),
          };
        }),
      ),
    [yearGrid, byDate, metric],
  );

  const yearStats = useMemo(() => {
    let activeDays = 0;
    let pastDays = 0;
    let totalChars = 0;
    let totalMinutes = 0;
    let bestValue = 0;
    let bestDate = "";

    populatedWeeks.forEach((week) =>
      week.forEach((cell) => {
        if (!cell.inYear || cell.isFuture) return;
        pastDays++;
        if (cell.value > 0) activeDays++;
        const day = byDate[cell.date];
        if (day) {
          totalChars += day.chars;
          totalMinutes += day.minutes;
        }
        if (cell.value > bestValue) {
          bestValue = cell.value;
          bestDate = cell.date;
        }
      }),
    );

    return { activeDays, pastDays, totalChars, totalMinutes, bestValue, bestDate };
  }, [populatedWeeks, byDate]);

  const nudgeYear = (delta: number) => onYearChange(year + delta);

  return (
    <div className="sa-card">
      <div className="sa-cal-head">
        <div className="sa-year-nav">
          <button
            className="sa-iconbtn"
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
          <h2>
            {year}
            <span className="yr-suffix" lang="ja">
              年
            </span>
          </h2>
          <button
            className="sa-iconbtn"
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
          <span className="sa-year-summary">
            <span className="num">{yearStats.activeDays}</span> days ·{" "}
            {metric === "chars" ? (
              <>
                {fmtChars(yearStats.totalChars)} <span lang="ja">字</span>
              </>
            ) : (
              fmtMinutes(yearStats.totalMinutes)
            )}
          </span>
        </div>

        {showMetricToggle ? (
          <div className="sa-metric">
            <button
              className={metric === "chars" ? "on" : ""}
              onClick={() => onMetricChange("chars")}
            >
              <span lang="ja">字</span> Chars
            </button>
            <button
              className={metric === "minutes" ? "on" : ""}
              onClick={() => onMetricChange("minutes")}
            >
              <span lang="ja">分</span> Minutes
            </button>
          </div>
        ) : (
          <div className="sa-metric" style={{ pointerEvents: "none" }}>
            <button className="on">
              <span lang="ja">分</span> Minutes
            </button>
          </div>
        )}
      </div>

      <div className="sa-cal-body">
        <div
          className="sa-yh"
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
              <div key={`m${weekIndex}`} className="sa-yh-month">
                {span ? MONTHS_EN[span.month].slice(0, 3) : ""}
              </div>
            );
          })}

          {DOW_JA.map((dow, dayIdx) => (
            <Fragment key={`r${dayIdx}`}>
              <div
                className={`sa-yh-dow ${[1, 3, 5].includes(dayIdx) ? "" : "hidden"}`}
                lang="ja"
              >
                {dow}
              </div>
              {populatedWeeks.map((week, weekIndex) => {
                const cell = week[dayIdx];
                const className = [
                  "sa-yh-cell",
                  !cell.inYear ? "out" : "",
                  cell.value > 0 && !cell.isFuture ? "has" : "",
                  cell.isFuture ? "future" : "",
                  cell.isToday ? "today" : "",
                ]
                  .filter(Boolean)
                  .join(" ");
                const title = cell.inYear
                  ? `${cell.date} · ${
                      cell.value > 0
                        ? metric === "chars"
                          ? `${fmtNum(cell.value)} chars`
                          : `${cell.value} min`
                        : emptyDayLabel
                    }`
                  : "";
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

      <div className="sa-cal-foot">
        <span>
          <span className="num">{yearStats.activeDays}</span> /{" "}
          {yearStats.pastDays} days {activityVerbPast} this year
          {yearStats.bestDate && (
            <>
              {" · best day: "}
              <span className="num">
                {yearStats.bestDate.slice(5)} (
                {metric === "chars" ? (
                  <>
                    {fmtChars(yearStats.bestValue)} <span lang="ja">字</span>
                  </>
                ) : (
                  `${yearStats.bestValue}m`
                )}
                )
              </span>
            </>
          )}
        </span>
        <span className="sa-legend">
          Less
          <span className="sa-legend-cells">
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
