import { NextRequest, NextResponse } from "next/server"

import { buildFilterRange, getDashboardMetrics, normalizeRange, recordDashboardEvent } from "@/lib/metrics"
import type { DashboardFilterPreset } from "@/types"
import { applySupabaseCookies, createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const supabaseResponse = NextResponse.next()
  const supabase = createClient({ request, response: supabaseResponse })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    applySupabaseCookies(supabaseResponse, unauthorized)
    return unauthorized
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

  const response = NextResponse.json(payload)
  applySupabaseCookies(supabaseResponse, response)
  return response
}
