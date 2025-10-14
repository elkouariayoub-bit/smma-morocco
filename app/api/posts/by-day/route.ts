import { NextResponse } from "next/server";
import { getTopPosts } from "@/lib/posts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  // naive: pull a week around the date and filter (mock store lacks direct day query)
  const data = await getTopPosts({ start: date, end: date, limit: 50 });
  return NextResponse.json({ data: data.filter((p) => p.date === date) });
}
