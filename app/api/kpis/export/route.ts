import { NextResponse } from "next/server"

import { getKpis } from "@/lib/kpi"
import { toCsv } from "@/lib/csv"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  if (!start || !end) return NextResponse.json({ error: "start/end required" }, { status: 400 })

  const { engagementRate, impressions, people } = await getKpis({ start, end })
  const map = new Map<
    string,
    { engagement_rate?: number; impressions?: number; people?: number }
  >()
  for (const point of engagementRate) {
    map.set(point.label, {
      ...(map.get(point.label) ?? {}),
      engagement_rate: point.value,
    })
  }
  for (const point of impressions) {
    map.set(point.label, {
      ...(map.get(point.label) ?? {}),
      impressions: point.value,
    })
  }
  for (const point of people) {
    map.set(point.label, {
      ...(map.get(point.label) ?? {}),
      people: point.value,
    })
  }

  const rows = Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      engagement_rate: values.engagement_rate ?? "",
      impressions: values.impressions ?? "",
      people: values.people ?? "",
    }))

  const csv = toCsv(rows)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="metrics_${start}_${end}.csv"`,
    },
  })
}
