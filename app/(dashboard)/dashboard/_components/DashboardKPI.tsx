"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type KPIValues = {
  engagementRate: string
  engagementNote?: string
  impressions: string
  impressionsNote?: string
  reached: string
  reachedNote?: string
  periodLabel?: string
}

const defaultKpis: KPIValues = {
  engagementRate: "5.4%",
  engagementNote: "Range: last period",
  impressions: "121.5K",
  impressionsNote: "Range: last period",
  reached: "53.2K",
  reachedNote: "Range: last period",
  periodLabel: undefined,
}

export function DashboardKPI(props: Partial<KPIValues>) {
  const kpis = { ...defaultKpis, ...props }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              {kpis.periodLabel
                ? `Performance for ${kpis.periodLabel}`
                : "Snapshot of your social performance"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">Engagement rate</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{kpis.engagementRate}</div>
            {kpis.engagementNote && (
              <div className="mt-1 text-xs text-muted-foreground">{kpis.engagementNote}</div>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">Impressions</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{kpis.impressions}</div>
            {kpis.impressionsNote && (
              <div className="mt-1 text-xs text-muted-foreground">{kpis.impressionsNote}</div>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">People reached</div>
            <div className="mt-2 text-3xl font-semibold tracking-tight">{kpis.reached}</div>
            {kpis.reachedNote && (
              <div className="mt-1 text-xs text-muted-foreground">{kpis.reachedNote}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
