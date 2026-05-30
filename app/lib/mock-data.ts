// Deterministic seeded mock sessions for the Statistics page. Real persistence
// is not implemented yet — these are static fixtures so the UI can render.

import { ymd } from "./format";

export type ReadingSession = {
  date: string;
  title: string;
  type: string;
  author: string;
  chars: number;
  minutes: number;
};

export type ListeningSession = {
  date: string;
  title: string;
  type: string;
  author: string;
  link: string;
  minutes: number;
};

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

const READ_TITLES = [
  { t: "よつばと！", type: "Manga", author: "あずまきよひこ" },
  { t: "時をかける少女", type: "Light novel", author: "筒井康隆" },
  { t: "コンビニ人間", type: "Book", author: "村田沙耶香" },
  { t: "夜は短し歩けよ乙女", type: "Light novel", author: "森見登美彦" },
  { t: "キッチン", type: "Book", author: "吉本ばなな" },
  { t: "魔女の宅急便", type: "Book", author: "角野栄子" },
];

const LISTEN_TITLES = [
  { t: "進撃の巨人", type: "Anime", author: "MAPPA", link: "" },
  { t: "呪術廻戦", type: "Anime", author: "MAPPA", link: "" },
  {
    t: "ゆる言語学ラジオ",
    type: "Podcast",
    author: "水野・堀元",
    link: "youtu.be/yurugengo",
  },
  {
    t: "日本語の森",
    type: "Podcast",
    author: "日本語の森",
    link: "youtu.be/nihongonomori",
  },
  { t: "ドラえもん", type: "Anime", author: "藤子・F・不二雄", link: "" },
  {
    t: "Nihongo con Teppei",
    type: "Podcast",
    author: "Teppei",
    link: "spoti.fi/teppei",
  },
  {
    t: "テラスハウス",
    type: "Drama",
    author: "Netflix",
    link: "nflx.it/terrace",
  },
];

function dateOffset(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return ymd(d);
}

function rng(seed: number) {
  let x = seed | 0;
  return () => {
    x = (x * 1664525 + 1013904223) | 0;
    return ((x >>> 0) % 100000) / 100000;
  };
}

function aggregate<
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
    if (byDate[dateOffset(i)]) streak++;
    else break;
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

function buildReading(): SessionStream<ReadingSession> {
  const rr = rng(42);
  const sessions: ReadingSession[] = [];
  for (let i = 0; i < 395; i++) {
    const day = rr();
    if (day < 0.22) continue;
    const count = day < 0.8 ? 1 : 2;
    for (let s = 0; s < count; s++) {
      const book = READ_TITLES[Math.floor(rr() * READ_TITLES.length)];
      const minutes = Math.round(15 + rr() * 95);
      const speed = 220 + rr() * 300;
      const chars = Math.round(minutes * speed);
      sessions.push({
        date: dateOffset(i),
        title: book.t,
        type: book.type,
        author: book.author,
        chars,
        minutes,
      });
    }
  }
  sessions.push({
    date: dateOffset(0),
    title: "よつばと！",
    author: "あずまきよひこ",
    type: "Manga",
    chars: 4280,
    minutes: 38,
  });
  sessions.push({
    date: dateOffset(1),
    title: "夜は短し歩けよ乙女",
    author: "森見登美彦",
    type: "Light novel",
    chars: 9620,
    minutes: 72,
  });
  return aggregate(sessions);
}

function buildListening(): SessionStream<ListeningSession> {
  const lr = rng(7);
  const sessions: ListeningSession[] = [];
  for (let i = 0; i < 395; i++) {
    const day = lr();
    if (day < 0.34) continue;
    const count = day < 0.85 ? 1 : 2;
    for (let s = 0; s < count; s++) {
      const item = LISTEN_TITLES[Math.floor(lr() * LISTEN_TITLES.length)];
      const minutes =
        item.type === "Anime"
          ? Math.round(22 + lr() * 6)
          : Math.round(18 + lr() * 52);
      sessions.push({
        date: dateOffset(i),
        title: item.t,
        type: item.type,
        author: item.author,
        link: item.link,
        minutes,
      });
    }
  }
  sessions.push({
    date: dateOffset(0),
    title: "呪術廻戦",
    author: "MAPPA",
    type: "Anime",
    link: "",
    minutes: 48,
  });
  sessions.push({
    date: dateOffset(2),
    title: "ゆる言語学ラジオ",
    author: "水野・堀元",
    type: "Podcast",
    link: "youtu.be/yurugengo",
    minutes: 63,
  });
  return aggregate(sessions);
}

export const READING_DATA = buildReading();
export const LISTENING_DATA = buildListening();
