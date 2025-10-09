import { NextResponse } from "next/server"

import { getKpis, previousRange } from "@/lib/kpi"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")
  const compare = searchParams.get("compare") === "1"

  if (!start || !end) {
    return NextResponse.json({ error: "start/end required" }, { status: 400 })
  }

  const current = await getKpis({ start, end })
  let previous: typeof current | undefined

  if (compare) {
    const pr = previousRange({ start, end })
    previous = await getKpis(pr)
  }

  return NextResponse.json({ current, previous })
}
