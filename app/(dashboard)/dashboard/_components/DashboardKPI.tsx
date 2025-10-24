"use client"

import type { ReactNode } from "react"
import type { DateRange } from "react-day-picker"
import { Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { KeyMetricsChart, type KeyMetricsChartDatum } from "./KeyMetricsChart"

export type KPIValues = {
  engagementRate: string
  impressions: string
  reached: string
  periodLabel?: string
  headerExtra?: ReactNode
  onExportCSV?: () => void
  onExportXLSX?: () => void
  onExportPDF?: () => void
  chartData?: KeyMetricsChartDatum[]
  chartRange?: DateRange
}

export function DashboardKPI({
  engagementRate,
  impressions,
  reached,
  periodLabel,
  headerExtra,
  onExportCSV,
  onExportXLSX,
  onExportPDF,
  chartData,
  chartRange,
}: KPIValues) {
  const handleCSV = () => {
    onExportCSV?.()
  }
  const handleXLSX = () => {
    onExportXLSX?.()
  }
  const handlePDF = () => {
    onExportPDF?.()
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Key Metrics</CardTitle>
            <CardDescription>
              {periodLabel ?? "Snapshot of your social performance"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {headerExtra}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleCSV} disabled={!onExportCSV}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleXLSX} disabled={!onExportXLSX}>
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handlePDF} disabled={!onExportPDF}>
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

        {chartData && <KeyMetricsChart data={chartData} range={chartRange} />}
      </CardContent>
    </Card>
  )
}
