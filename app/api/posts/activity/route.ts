import { NextResponse } from "next/server";
import { getTopPosts } from "@/lib/posts";

// Returns [{ date: 'YYYY-MM-DD', count: number }]
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  if (!start || !end) {
    return NextResponse.json({ error: "start/end required" }, { status: 400 });
  }

  const posts = await getTopPosts({ start, end, limit: 500 });
  const counts = new Map<string, number>();

  for (const post of posts) {
    counts.set(post.date, (counts.get(post.date) ?? 0) + 1);
  }

  const data = Array.from(counts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));

  return NextResponse.json({ data });
}
