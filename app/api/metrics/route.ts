import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

import { buildFilterRange, getDashboardMetrics, normalizeRange, recordDashboardEvent } from "@/lib/metrics"
import type { DashboardFilterPreset } from "@/types"

export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const preset = url.searchParams.get("preset") as DashboardFilterPreset | null
  const from = url.searchParams.get("from")
  const to = url.searchParams.get("to")

  const range = preset ? buildFilterRange(preset) : normalizeRange({ from, to })

  const payload = await getDashboardMetrics({ from: range.from, to: range.to })

  if (preset) {
    await recordDashboardEvent(
      "metric_filter_applied",
      { preset, from: range.from, to: range.to },
      session.user.id
    )
  }

  return NextResponse.json(payload)
}
