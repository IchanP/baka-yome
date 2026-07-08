import { NextResponse } from "next/server";
import { createEntry, listEntries } from "@/app/server/entries";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import {
  createNewEntry,
  isImmersionKind,
  isSource,
  sourcesForKind,
} from "@/app/lib/types";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const entries = await listEntries(supabase);
    return NextResponse.json(entries);
  } catch(e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { kind, unit, amount, title, occurredOn, source } = body;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "The amount must be a positive number" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Title  cannot be empty" }, { status: 400 });
  }

  if (!isImmersionKind(kind)) {
    return NextResponse.json(
      { error: "Invalid kind. Must be one of 'listening' or 'reading'." },
      { status: 400 },
    );
  }

  if (!isSource(source) || !sourcesForKind(kind).includes(source)) {
    return NextResponse.json(
      { error: "Invalid source for the selected kind." },
      { status: 400 },
    );
  }

  if (unit !== "minutes" && unit !== "characters") {
    return NextResponse.json(
      { error: "Invalid unit measurement. Must be one of 'minutes' or 'characters'" },
      { status: 400 },
    );
  }

  let entryRow;
  try {
    const newEntry = createNewEntry({ title, kind, amount, unit, occurredOn, source });
    entryRow = await createEntry(supabase, newEntry);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Something went wrong when saving to database" },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: entryRow }, { status: 201 });
}
