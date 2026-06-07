import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

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
  const { amount, title } = body;

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "The amount must be a positive number" }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ error: "Title  cannot be empty" }, { status: 400 });
  }

  return NextResponse.json({ message: "Entry recorded!" }, { status: 201 });

  // TODO submit to supabase.

  // const name = typeof body.name === "string" ? body.name.trim() : "";

  // const entries = await readEntries();
  // const entry: Entry = {
  //   date: new Date().toISOString(),
  //   characters,
  //   ...(name ? { name } : {}),
  // };
  // entries.push(entry);
  // await fs.writeFile(dataFile, JSON.stringify(entries, null, 2));

  // return NextResponse.json(entry, { status: 201 });
}
