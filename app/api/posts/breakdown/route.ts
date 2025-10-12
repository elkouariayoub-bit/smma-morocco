import { NextResponse } from "next/server";
import { getBreakdown, type Breakdown, type Metric, type Platform } from "@/lib/breakdown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const METRICS: Metric[] = ["engagement_rate", "impressions", "people"];
const BREAKDOWNS: Breakdown[] = ["gender", "age", "geo"];
const PLATFORMS: (Platform | "all")[] = ["instagram", "tiktok", "facebook", "x", "all"];

function parseMetric(value: string | null): Metric {
  if (value && METRICS.includes(value as Metric)) {
    return value as Metric;
  }
  return "impressions";
}

function parseBreakdown(value: string | null): Breakdown {
  if (value && BREAKDOWNS.includes(value as Breakdown)) {
    return value as Breakdown;
  }
  return "gender";
}

function parsePlatform(value: string | null): Platform | "all" {
  if (value && PLATFORMS.includes(value as Platform | "all")) {
    return value as Platform | "all";
  }
  return "all";
}

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
