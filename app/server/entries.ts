import type { SupabaseClient } from "@supabase/supabase-js";
import type { Entry, NewEntry } from "../lib/types";

const TABLE = "entries";

// The Supabase client is passed in (not imported) so this module never touches
// `next/headers`, keeping the data layer transport-agnostic — the same reason
// the SQL migrations are ORM-neutral (a future Rust server can reuse the shape).
// Callers pass the request-scoped client from createSupabaseServerClient(), so
// every query runs AS the logged-in user and RLS does the per-user filtering.

/** Raw row as stored in Postgres*/
type EntryRow = {
  id: string;
  user_id: string;
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

// Get recent entries. RLS restricts the result to the caller's own rows, so no
// manual user_id filter is needed here.
export async function listEntries(supabase: SupabaseClient): Promise<Entry[]> {
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
export async function createEntry(
  supabase: SupabaseClient,
  input: NewEntry,
): Promise<Entry> {
  const payload: Record<string, unknown> = {
    kind: input.kind,
    source: input.source,
    title: input.title ?? null,
    characters: input.characters ?? null,
    minutes: input.minutes ?? null,
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
