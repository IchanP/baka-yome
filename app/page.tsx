"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { HeroStats } from "./components/HeroStats";
import { LogSession } from "./components/LogSession";
import { RecentSessions } from "./components/RecentSessions";
import { YearHeatmap, type HeatmapMetric } from "./components/YearHeatmap";
import { buildStreamFromEntries } from "./lib/stream";
import type { Entry } from "./lib/types";
import { useMode, type Mode } from "./providers/ModeContext";
import styles from "./page.module.css";

const fetcher = (url: string): Promise<Entry[]> =>
  fetch(url).then((r) => r.json());

const RECENT_LIMIT = 8;

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

  let heatmapMetric: HeatmapMetric = "minutes";
  if (isReading) {
    heatmapMetric = "chars";
  }
  if (isOverall) {
    heatmapMetric = "overall";
  }

  // Is auto-updated using the mutate API in logsession.
  const { data: entries, isLoading } = useSWR<Entry[]>("/api/entries", fetcher);

  // One transform feeds both HeroStats and 
  // the heatmap; recomputes whenever the
  // SWR cache changes (including LogSession's optimistic mutate).
  const streams = useMemo(() => {
    const all = entries ?? [];
    return {
      reading: buildStreamFromEntries(all.filter((e) => e.kind === "reading")),
      listening: buildStreamFromEntries(
        all.filter((e) => e.kind === "listening"),
      ),
      overall: buildStreamFromEntries(all),
    };
  }, [entries]);
  const stream = streams[mode];

  const recentSessions = useMemo<Entry[]>(() => {
    const all = entries ?? [];
    let filtered = all;
    if (isReading) {
      filtered = all.filter((e) => e.kind === "reading");
    } else if (isListening) {
      filtered = all.filter((e) => e.kind === "listening");
    }
    return filtered?.slice(0, RECENT_LIMIT) || [];
  }, [entries, isReading, isListening]);

  return (
    <>
      <HeroStats
        stream={stream}
        mode={mode}
        reading={streams.reading}
        listening={streams.listening}
        isLoading={isLoading}
      />

      {/* ── Body: heatmap + log (left col) · recent (right col) ── */}
      <div className={styles.body}>
        <div className={styles.grid}>
          <div className={styles.colMain}>
            <YearHeatmap
              year={year}
              onYearChange={setYear}
              byDate={stream.byDate}
              metric={heatmapMetric}
              emptyDayLabel={EMPTY_DAY_LABEL[mode]}
              activityVerbPast={ACTIVITY_VERB_PAST[mode]}
            />
            <LogSession mode={mode} />
          </div>

          {/* Recent sessions (narrow rail on ≥760px, stacked below on mobile) */}
          <RecentSessions
            sessions={recentSessions}
            isOverall={isOverall}
            isLoading={isLoading}
          />
        </div>
      </div>
    </>
  );
}
