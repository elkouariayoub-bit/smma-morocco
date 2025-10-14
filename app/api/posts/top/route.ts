import { NextResponse } from "next/server";
import { getTopPosts } from "@/lib/posts";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const limitParam = searchParams.get("limit");

  if (!start || !end) {
    return NextResponse.json({ error: "start/end required" }, { status: 400 });
  }

  const limit = Number(limitParam ?? 50);
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 50;

  const data = await getTopPosts({ start, end, limit: safeLimit });

  return NextResponse.json({ data });
}
