"use client";

import { useMemo, useState } from "react";
import { HeroStats } from "./components/HeroStats";
import { LogSession } from "./components/LogSession";
import { RecentSessions } from "./components/RecentSessions";
import { YearHeatmap, type HeatmapMetric } from "./components/YearHeatmap";
import {
  LISTENING_DATA,
  OVERALL_DATA,
  READING_DATA,
  type TaggedListeningSession,
  type TaggedReadingSession,
  type TaggedSession,
} from "./lib/mock-data";
import { useMode, type Mode } from "./providers/ModeContext";

// Per-mode copy + data, keyed by mode so the page reads as lookups not ternaries.
const STREAMS = {
  overall: OVERALL_DATA,
  reading: READING_DATA,
  listening: LISTENING_DATA,
};
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

  // Only reading has a character count, so only reading offers the chars/min
  // toggle — overall and listening are always minute-based.
  let heatmapMetric: HeatmapMetric = "minutes";
  if (isReading) {heatmapMetric = readingMetric;}

  // Recent rows are always tagged so the component can render each by its kind
  // (and show the reading/listening dot in overall).
  const recentSessions = useMemo<TaggedSession[]>(() => {
    let tagged: TaggedSession[];
    if (isOverall) {
      tagged = OVERALL_DATA.sessions;
    } else if (isListening) {
      tagged = LISTENING_DATA.sessions.map(
        (s): TaggedListeningSession => ({ ...s, kind: "listening" }),
      );
    } else {
      tagged = READING_DATA.sessions.map(
        (s): TaggedReadingSession => ({ ...s, kind: "reading" }),
      );
    }
    return [...tagged]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8);
  }, [isOverall, isListening]);

  return (
    <>
      <HeroStats stream={stream} mode={mode} />

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
