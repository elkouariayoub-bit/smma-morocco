import { NextResponse } from "next/server"

import { addAlert } from "@/lib/alerts"
import { getKpis } from "@/lib/kpi"

function pctChange(latest: number, avg: number) {
  return (latest - avg) / (avg || 1)
}

export async function GET() {
  const now = new Date()
  const end = now.toISOString().slice(0, 10)
  const startDate = new Date(now)
  startDate.setDate(startDate.getDate() - 6)
  const range = { start: startDate.toISOString().slice(0, 10), end }

  const { engagementRate, impressions, people } = await getKpis(range)

  const scan = (name: string, series: { value: number }[]) => {
    if (series.length === 0) return

    const latest = series[series.length - 1]?.value
    if (typeof latest !== "number") return

    const historical = series.slice(0, -1)
    const avg =
      historical.reduce((sum, point) => sum + (point.value ?? 0), 0) /
      Math.max(historical.length, 1)

    const change = pctChange(latest, avg)

    if (Math.abs(change) >= 0.4) {
      addAlert({
        id: `${name}-${Date.now()}`,
        title: `${name}: ${change > 0 ? "+" : ""}${Math.round(change * 100)}% vs 7d avg`,
        severity: Math.abs(change) >= 0.6 ? "high" : "med",
        createdAt: new Date().toISOString(),
      })
    }
  }

  scan("Impressions", impressions)
  scan("People", people)
  scan("Engagement rate", engagementRate)

  return NextResponse.json({ ok: true })
}
