import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");

  let notes = db.notes;
  if (source && source !== "all") {
    notes = notes.filter((n: Record<string, unknown>) => n.source === source);
  }

  // Sort by timestamp descending
  notes.sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
    new Date(b.timestamp as string).getTime() - new Date(a.timestamp as string).getTime()
  );

  return NextResponse.json(notes);
}

export async function POST(request: Request) {
  const data = await request.json();

  const newNote = {
    id: Date.now(),
    title: data.title || "Untitled Note",
    content: data.content || "",
    source: data.source || "manual",
    timestamp: new Date().toISOString(),
    kanbanCardId: data.kanbanCardId || null,
    ...(data.source === "notion" && { notionUrl: data.notionUrl }),
    ...(data.source === "obsidian" && { obsidianUri: data.obsidianUri }),
  };

  db.notes.unshift(newNote);
  return NextResponse.json(newNote, { status: 201 });
}
