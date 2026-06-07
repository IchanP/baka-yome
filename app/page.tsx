"use client";

import { useMemo, useState } from "react";
import { HeroStats } from "./components/HeroStats";
import { LogSession } from "./components/LogSession";
import { RecentSessions } from "./components/RecentSessions";
import { YearHeatmap, type HeatmapMetric } from "./components/YearHeatmap";
import { LISTENING_DATA, READING_DATA } from "./lib/mock-data";
import { useMode } from "./providers/ModeContext";

export default function StatisticsPage() {
  const { mode, isListening } = useMode();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [readingMetric, setReadingMetric] = useState<HeatmapMetric>("chars");

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

  return (
    <>
      <HeroStats stream={stream} isListening={isListening} />

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
            <LogSession mode={mode} isListening={isListening} />
          </div>

          {/* Recent sessions (right column on ≥760px, stacked below on mobile) */}
          <RecentSessions sessions={recentSessions} isListening={isListening} />
        </div>
      </div>
    </>
  );
}
