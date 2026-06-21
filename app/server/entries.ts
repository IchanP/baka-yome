import { getServiceClient } from "./supabase";
import type { Entry, NewEntry } from "../lib/types";

const TABLE = "entries";

/** Raw row as stored in Postgres*/
type EntryRow = {
  id: string;
  user_id: string | null;
  kind: Entry["kind"];
  source: Entry["source"];
  title: string | null;
  occurred_on: string;
  characters: number | null;
  minutes: number | null;
  created_at: string;
};

function toEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    kind: row.kind,
    source: row.source,
    title: row.title,
    occurredOn: row.occurred_on,
    characters: row.characters,
    minutes: row.minutes,
    createdAt: row.created_at,
  };
}

// Get recent entries
export async function listEntries(): Promise<Entry[]> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list entries: ${error.message}`);
  }
  return (data as EntryRow[]).map(toEntry);
}

/** Insert a new entry*/
export async function createEntry(input: NewEntry): Promise<Entry> {
  const supabase = getServiceClient();

  const payload: Record<string, unknown> = {
    kind: input.kind,
    source: input.source,
    title: input.title ?? null,
    characters: input.characters ?? null,
    minutes: input.minutes ?? null,
    user_id: input.userId ?? null,
  };

  // Will default to the Supabase current date if omitted
  if (input.occurredOn) {
    payload.occurred_on = input.occurredOn;
  }

  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create entry: ${error.message}`);
  }
  return toEntry(data as EntryRow);
}
