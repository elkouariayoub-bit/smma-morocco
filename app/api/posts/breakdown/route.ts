import { NextResponse } from "next/server";
import {
  getBreakdown,
  parseBreakdown,
  parseMetric,
  parsePlatform,
  type Breakdown,
  type Metric,
  type Platform,
} from "@/lib/breakdown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  if (!start || !end) {
    return NextResponse.json({ error: "start/end required" }, { status: 400 });
  }

  const metric = parseMetric(searchParams.get("metric"));
  const by = parseBreakdown(searchParams.get("by"));
  const platform = parsePlatform(searchParams.get("platform"));

  const data = await getBreakdown({ start, end, metric, by, platform });
  return NextResponse.json({ data });
}
