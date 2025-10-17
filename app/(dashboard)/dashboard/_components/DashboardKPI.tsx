"use client"

import { Download } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export type KPIValues = {
  engagementRate: string
  impressions: string
  reached: string
  periodLabel?: string
  onExport?: () => void
}

export function DashboardKPI({ engagementRate, impressions, reached, periodLabel, onExport }: KPIValues) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              {periodLabel ? `Performance for ${periodLabel}` : "Snapshot of your social performance"}
            </CardDescription>
          </div>
          <Button onClick={onExport} variant="outline" className="gap-2" disabled={!onExport}>
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">Engagement rate</div>
            <div className="mt-2 text-3xl font-semibold">{engagementRate}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">Impressions</div>
            <div className="mt-2 text-3xl font-semibold">{impressions}</div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="text-xs font-medium uppercase text-muted-foreground">People reached</div>
            <div className="mt-2 text-3xl font-semibold">{reached}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
