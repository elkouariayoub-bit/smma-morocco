export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"

import { toCsv } from "@/lib/csv"
import { buildMetricRows } from "@/lib/exportRows"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  if (!start || !end) return NextResponse.json({ error: "start/end required" }, { status: 400 })

  const rows = await buildMetricRows(start, end)
  const csv = toCsv(rows)
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="metrics_${start}_${end}.csv"`,
    },
  })
}
