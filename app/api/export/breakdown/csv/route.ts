export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getBreakdown } from "@/lib/breakdown";

function toCsv(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  };
  return [headers.join(","), ...rows.map(r => headers.map(h => esc(r[h])).join(","))].join("\n");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const params = {
    start: searchParams.get("start")!, end: searchParams.get("end")!,
    metric: searchParams.get("metric") as any, by: searchParams.get("by") as any,
    platform: (searchParams.get("platform") || "all") as any
  };
  const { rows } = await getBreakdown(params);
  const csv = toCsv(rows.map(r => ({
    segment_key: r.key, segment_label: r.label, value: r.value,
    pct: r.pct != null ? Math.round(r.pct*100) : ""
  })));
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="breakdown_${params.by}_${params.metric}_${params.start}_${params.end}.csv"`
    }
  });
}
