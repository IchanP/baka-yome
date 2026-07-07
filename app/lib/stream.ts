// Aggregates immersion sessions into a per-day/streak/week summary the
// Statistics UI (HeroStats, YearHeatmap) renders from.

import { ymd } from "./format";
import type { Entry } from "./types";

export type DayAggregate<T> = {
  chars: number;
  minutes: number;
  sessions: T[];
};

export type SessionStream<T> = {
  sessions: T[];
  byDate: Record<string, DayAggregate<T>>;
  totals: { chars: number; minutes: number };
  streak: number;
  week: { minutes: number; chars: number };
};

function dateOffset(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
}

// Metric-agnostic: rows without `chars` (e.g. listening) read as 0.
export function aggregate<
  T extends { date: string; chars?: number; minutes?: number },
>(sessions: T[]): SessionStream<T> {
  const byDate: Record<string, DayAggregate<T>> = {};
  for (const s of sessions) {
    if (!byDate[s.date]) {
      byDate[s.date] = { chars: 0, minutes: 0, sessions: [] };
    }
    byDate[s.date].chars += s.chars || 0;
    byDate[s.date].minutes += s.minutes || 0;
    byDate[s.date].sessions.push(s);
  }

  let totalChars = 0;
  let totalMinutes = 0;
  for (const s of sessions) {
    totalChars += s.chars || 0;
    totalMinutes += s.minutes || 0;
  }

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    if (byDate[dateOffset(i)]) {streak++;}
    else {break;}
  }

  let weekMinutes = 0;
  let weekChars = 0;
  for (let i = 0; i < 7; i++) {
    const d = byDate[dateOffset(i)];
    if (d) {
      weekMinutes += d.minutes;
      weekChars += d.chars;
    }
  }

  return {
    sessions,
    byDate,
    totals: { chars: totalChars, minutes: totalMinutes },
    streak,
    week: { minutes: weekMinutes, chars: weekChars },
  };
}

// Bridges the real `Entry` shape (occurredOn / characters, both nullable) onto
// the aggregate input. Group by `occurredOn` (YYYY-MM-DD) via string equality —
// parsing it through `new Date()` would shift days across timezones.
export function buildStreamFromEntries(entries: Entry[]): SessionStream<Entry> {
  const rows = entries.map((e) => ({
    ...e,
    date: e.occurredOn,
    chars: e.characters ?? 0,
    minutes: e.minutes ?? 0,
  }));
  return aggregate(rows);
}
