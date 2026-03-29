import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  // Support searching by username query param
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username') || "alex_dev"; 

  const user = db.users.find(u => u.username === username);
  
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Find user's posts
  const userPosts = db.posts.filter(p => p.user === username);

  return NextResponse.json({
    ...user,
    posts: userPosts
  });
}
