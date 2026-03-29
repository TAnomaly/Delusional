import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return NextResponse.json(db.kanban);
}

export async function POST(request: Request) {
  const { columnId, cardText } = await request.json();
  const column = db.kanban.find(c => c.id === columnId);
  
  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const newCard = {
    id: Date.now(),
    text: cardText
  };

  column.cards.push(newCard);
  
  return NextResponse.json(newCard, { status: 201 });
}
