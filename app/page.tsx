"use client";

import { useEffect, useState } from "react";

type Entry = {
  date: string;
  characters: number;
  name?: string;
};

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [characters, setCharacters] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/entries")
      .then((res) => res.json())
      .then((data: Entry[]) => setEntries(data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(characters);
    if (!Number.isFinite(value) || value <= 0) return;

    setSubmitting(true);
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ characters: value, name: name.trim() }),
    });
    setSubmitting(false);

    if (res.ok) {
      const entry: Entry = await res.json();
      setEntries((prev) => [...prev, entry]);
      setCharacters("");
      setName("");
    }
  }

  const total = entries.reduce((sum, entry) => sum + entry.characters, 0);

  const dayGroups: { key: string; label: string; items: Entry[] }[] = [];
  for (const entry of [...entries].sort((a, b) =>
    b.date.localeCompare(a.date),
  )) {
    const d = new Date(entry.date);
    const key = d.toDateString();
    const last = dayGroups[dayGroups.length - 1];
    if (last && last.key === key) {
      last.items.push(entry);
    } else {
      dayGroups.push({
        key,
        label: d.toLocaleDateString(undefined, {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        items: [entry],
      });
    }
  }

  return (
    <main className="flex flex-1 w-full max-w-2xl mx-auto flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Japanese Immersion Tracker
        </h1>
        <p className="text-sm text-zinc-500">
          Log the number of <span lang="ja">日本語</span> characters you read.
        </p>
      </header>

      <section className="flex flex-col items-center gap-1 rounded-xl border border-zinc-200 bg-zinc-50 py-8 dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-sm uppercase tracking-wide text-zinc-500">
          All-time total
        </span>
        <span className="text-5xl font-bold tabular-nums">
          {total.toLocaleString()}
        </span>
        <span className="text-sm text-zinc-500">characters</span>
      </section>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Book or title (optional)"
          lang="ja"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <div className="flex gap-3">
          <input
            type="number"
            inputMode="numeric"
            value={characters}
            onChange={(e) => setCharacters(e.target.value)}
            placeholder="Characters read"
            required
            className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-zinc-900 px-5 py-2 font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            Log
          </button>
        </div>
      </form>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          History
        </h2>
        {dayGroups.length === 0 ? (
          <p className="text-sm text-zinc-500">No entries yet.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {dayGroups.map((group) => (
              <div key={group.key} className="flex flex-col gap-1">
                <h3 className="border-b border-zinc-200 pb-1 text-sm font-semibold text-zinc-700 dark:border-zinc-800 dark:text-zinc-300">
                  {group.label}
                </h3>
                <ul className="flex flex-col divide-y divide-zinc-100 dark:divide-zinc-900">
                  {group.items.map((entry, i) => (
                    <li
                      key={`${entry.date}-${i}`}
                      className="flex items-center justify-between gap-4 py-2"
                    >
                      {entry.name ? (
                        <span lang="ja" className="font-medium">
                          {entry.name}
                        </span>
                      ) : (
                        <span className="text-zinc-400">Untitled</span>
                      )}
                      <span className="font-medium tabular-nums">
                        {entry.characters.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
