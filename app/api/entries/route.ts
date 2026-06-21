import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { createEntry } from "@/app/server/entries";
import {
  createNewEntry,
  ImmersionKind,
  isImmersionKind,
  isSource,
  NewEntry,
  sourcesForKind,
} from "@/app/lib/types";

export type Entry = {
  date: string;
  characters: number;
  name?: string;
};

const dataFile = path.join(process.cwd(), "data", "entries.json");

async function readEntries(): Promise<Entry[]> {
  const raw = await fs.readFile(dataFile, "utf-8");
  return JSON.parse(raw) as Entry[];
}

export async function GET() {
  const entries = await readEntries();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
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

  try {
    const newEntry = createNewEntry({ title, kind, amount, unit, occurredOn, source });
    await createEntry(newEntry);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Something went wrong when saving to database" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "Entry recorded!" }, { status: 201 });
}
