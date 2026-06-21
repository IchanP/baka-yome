export type ImmersionKind = "reading" | "listening";

export function isImmersionKind(kind: unknown): kind is ImmersionKind {
  const IMMERSION_KINDS = ["reading", "listening"];
  return IMMERSION_KINDS.includes(kind as ImmersionKind);
}

export type Entry = {
  id: string;
  userId: string | null;
  kind: ImmersionKind;
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
 * @returns a new NewEntry object.
 */
export function createNewEntry(baseData: {
  title?: string;
  kind: ImmersionKind;
  amount: number;
  unit: "minutes" | "characters";
  occurredOn: string | undefined;
}): NewEntry {
  const { title, kind, amount, unit, occurredOn } = baseData;

  // TODO add a userId somewhere... need login for that ignore for now
  const entry: NewEntry = { kind, occurredOn };
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
