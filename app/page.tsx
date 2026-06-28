"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { HeroStats } from "./components/HeroStats";
import { LogSession } from "./components/LogSession";
import { RecentSessions } from "./components/RecentSessions";
import { YearHeatmap, type HeatmapMetric } from "./components/YearHeatmap";
import {
  LISTENING_DATA,
  OVERALL_DATA,
  READING_DATA,
} from "./lib/mock-data";
import type { Entry } from "./lib/types";
import { useMode, type Mode } from "./providers/ModeContext";
import styles from "./page.module.css";

const fetcher = (url: string): Promise<Entry[]> =>
  fetch(url).then((r) => r.json());

// Per-mode copy + data, keyed by mode so the page reads as lookups not ternaries.
const STREAMS = {
  overall: OVERALL_DATA,
  reading: READING_DATA,
  listening: LISTENING_DATA,
};

// TODO move these into yearheatmap
const EMPTY_DAY_LABEL: Record<Mode, string> = {
  overall: "no activity",
  reading: "no reading",
  listening: "no listening",
};
const ACTIVITY_VERB_PAST: Record<Mode, string> = {
  overall: "active",
  reading: "read",
  listening: "listened",
};

export default function StatisticsPage() {
  const { mode, isOverall, isReading, isListening } = useMode();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [readingMetric, setReadingMetric] = useState<HeatmapMetric>("chars");
  const stream = STREAMS[mode];

  let heatmapMetric: HeatmapMetric = "minutes";
  if (isReading) {heatmapMetric = readingMetric;}

  // Is auto-updated using the mutate API in logsession.
  const { data: entries } = useSWR<Entry[]>("/api/entries", fetcher);

  const recentSessions = useMemo<Entry[]>(() => {
    const all = entries ?? [];
    let filtered = all;
    if (isReading) {
      filtered = all.filter((e) => e.kind === "reading");
    } else if (isListening) {
      filtered = all.filter((e) => e.kind === "listening");
    }
    return filtered.slice(0, 8);
  }, [entries, isReading, isListening]);

  return (
    <>
      <HeroStats stream={stream} mode={mode} />

      {/* ── Body: heatmap + log (left col) · recent (right col) ── */}
      <div className={styles.body}>
        <div className={styles.grid}>
          <div className={styles.colMain}>
            <YearHeatmap
              year={year}
              onYearChange={setYear}
              byDate={stream.byDate}
              metric={heatmapMetric}
              onMetricChange={setReadingMetric}
              showMetricToggle={isReading}
              emptyDayLabel={EMPTY_DAY_LABEL[mode]}
              activityVerbPast={ACTIVITY_VERB_PAST[mode]}
            />
            <LogSession mode={mode} />
          </div>

          {/* Recent sessions (narrow rail on ≥760px, stacked below on mobile) */}
          <RecentSessions sessions={recentSessions} isOverall={isOverall} />
        </div>
      </div>
    </>
  );
}
