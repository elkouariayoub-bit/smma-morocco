export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { toCsv } from "@/lib/csv";
import { getBreakdown, parseBreakdown, parseMetric, parsePlatform } from "@/lib/breakdown";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) {
      return NextResponse.json({ error: "start/end required" }, { status: 400 });
    }

    const metric = parseMetric(searchParams.get("metric"));
    const by = parseBreakdown(searchParams.get("by"));
    const platform = parsePlatform(searchParams.get("platform"));

    const { rows } = await getBreakdown({ start, end, metric, by, platform });
    const csv = toCsv(
      rows.map((row) => ({
        segment_key: row.key,
        segment_label: row.label,
        value: row.value,
        pct: row.pct != null ? Math.round(row.pct * 100) : "",
      }))
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="breakdown_${by}_${metric}_${start}_${end}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("/api/export/breakdown/csv error", error);
    return NextResponse.json({ error: "failed to export breakdown" }, { status: 500 });
  }
}
