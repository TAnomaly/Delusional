import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  return NextResponse.json(db.posts);
}

export async function POST(request: Request) {
  const data = await request.json();
  
  const newPost = {
    id: Date.now(),
    user: "alex_dev", // Defaulting to the logged in mock user
    title: data.title,
    image: data.image || "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=800",
    tags: data.tags || [],
    likes: 0
  };

  db.posts.unshift(newPost); // Add to beginning
  
  return NextResponse.json(newPost, { status: 201 });
}
