export type ImmersionKind = "reading" | "listening";

export function isImmersionKind(kind: unknown): kind is ImmersionKind {
  const IMMERSION_KINDS = ["reading", "listening"];
  return IMMERSION_KINDS.includes(kind as ImmersionKind);
}

// Stable codes stored in the DB `source` column — don't rename without a migration.
export const SOURCES = [
  "novel",
  "manga",
  "visual_novel",
  "anime",
  "youtube",
  "podcast",
  "other",
] as const;

export type Source = (typeof SOURCES)[number];

export function isSource(value: unknown): value is Source {
  return SOURCES.includes(value as Source);
}

export const SOURCE_LABELS: Record<Source, string> = {
  novel: "Novel",
  manga: "Manga",
  visual_novel: "Visual Novel",
  anime: "Anime",
  youtube: "YouTube",
  podcast: "Podcast",
  other: "Other",
};

// Sources offered per mode; "other" is shared.
const READING_SOURCES: Source[] = ["novel", "manga", "visual_novel", "other"];
const LISTENING_SOURCES: Source[] = ["anime", "youtube", "podcast", "other"];

export function sourcesForKind(kind: ImmersionKind): Source[] {
  return kind === "listening" ? LISTENING_SOURCES : READING_SOURCES;
}

export type Entry = {
  id: string;
  userId: string | null;
  kind: ImmersionKind;
  source: Source;
  title: string | null;
  /**  YYYY-MM-DD. */
  occurredOn: string;
  characters: number | null;
  minutes: number | null;
  /** ISO timestamp */
  createdAt: string;
};

export type NewEntry = {
  kind: ImmersionKind;
  source: Source;
  title?: string | null;
  // YYYY-MM-DD user may set it to backfill
  occurredOn?: string;
  characters?: number | null;
  minutes?: number | null;
  userId?: string | null;
};

/**
 * Creates a NewEntry type.
 * @param {object} baseData
 *  The base data to build from
 *
 * @param {string} baseData.title
 *  The title of the entry.
 *
 * @param {ImmersionKind} baseData.kind
 *  Whether it's a listen/read entry
 *
 * @param {number} baseData.amount
 *  The amount either minutes or characters immersed.
 *
 * @param {"minutes" | "characters"} baseData.unit
 *  Whether amount is in minuter or characters.
 *
 * @param {string | undefined} baseData.occurredOn
 *  The day the entry should be recorded as having occured on.
 *
 * @param {Source} baseData.source
 *  The media type the session was (e.g. novel, anime).
 *
 * @returns a new NewEntry object.
 */
export function createNewEntry(baseData: {
  title?: string;
  kind: ImmersionKind;
  amount: number;
  unit: "minutes" | "characters";
  occurredOn: string | undefined;
  source: Source;
}): NewEntry {
  const { title, kind, amount, unit, occurredOn, source } = baseData;

  // TODO add a userId somewhere... need login for that ignore for now
  const entry: NewEntry = { kind, source, occurredOn };
  if (unit === "minutes") {
    entry["minutes"] = amount;
  } else {
    entry["characters"] = amount;
  }

  if (title) {
    entry["title"] = title;
  }

  return entry;
}
