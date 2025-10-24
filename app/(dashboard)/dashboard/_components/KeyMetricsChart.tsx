"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export type KeyMetricsChartDatum = {
  dateISO: string
  dateLabel: string
  engagementRate: number
  impressions: number
  reached: number
}

const chartConfig = {
  engagementRate: { label: "Engagement Rate", color: "var(--chart-1)" },
  impressions: { label: "Impressions", color: "var(--chart-2)" },
  reached: { label: "People Reached", color: "var(--chart-3)" },
} satisfies ChartConfig

const MS_IN_DAY = 86_400_000

function normalizeDate(date: Date | string) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function formatShort(dateISO: string) {
  return new Date(dateISO).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function computeLabel(range: DateRange | undefined, data: KeyMetricsChartDatum[]) {
  if (range?.from && range?.to) {
    const start = normalizeDate(range.from)
    const end = normalizeDate(range.to)
    const days = Math.abs(Math.round((end.getTime() - start.getTime()) / MS_IN_DAY)) + 1
    return `Showing metrics for ${days} day${days === 1 ? "" : "s"}`
  }

  if (data.length === 1) {
    return `Showing metrics for ${formatShort(data[0].dateISO)}`
  }

  if (data.length > 1) {
    const first = data[0]
    const last = data[data.length - 1]
    return `Showing metrics from ${formatShort(first.dateISO)} to ${formatShort(last.dateISO)}`
  }

  return "Showing metrics over time"
}

export function KeyMetricsChart({
  data,
  range,
}: {
  data: KeyMetricsChartDatum[]
  range?: DateRange
}) {
  const labelText = React.useMemo(() => computeLabel(range, data), [range, data])

  const labelFormatter = React.useCallback(
    (value: string) => {
      const matching = data.find((datum) => datum.dateLabel === value)
      if (!matching) {
        return value
      }
      return format(new Date(matching.dateISO), "MMM d, yyyy")
    },
    [data],
  )

  const valueFormatter = React.useCallback((value: number, name?: string) => {
    if (name === chartConfig.engagementRate.label) {
      return `${value.toFixed(2)}%`
    }
    return value.toLocaleString()
  }, [])

  if (data.length === 0) {
    return (
      <div className="mt-6 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        No data available for this period
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground">Audience trend</h3>
        <p className="text-sm text-muted-foreground/80">{labelText}</p>
      </div>
      <ChartContainer config={chartConfig} className="h-64 w-full">
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 12, bottom: 0 }}>
          <defs>
            <linearGradient id="fillEngagementRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-engagementRate)" stopOpacity={0.25} />
              <stop offset="95%" stopColor="var(--color-engagementRate)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-impressions)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-impressions)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="fillReached" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-reached)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-reached)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="dateLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
          />
          <YAxis
            yAxisId="default"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => value.toLocaleString()}
            width={80}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value.toFixed(0)}%`}
            width={60}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            content={
              <ChartTooltipContent
                indicator="dot"
                labelFormatter={labelFormatter}
                valueFormatter={valueFormatter}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="impressions"
            yAxisId="default"
            stroke="var(--color-impressions)"
            fill="url(#fillImpressions)"
            strokeWidth={2}
            dot={false}
            name={chartConfig.impressions.label}
          />
          <Area
            type="monotone"
            dataKey="reached"
            yAxisId="default"
            stroke="var(--color-reached)"
            fill="url(#fillReached)"
            strokeWidth={2}
            dot={false}
            name={chartConfig.reached.label}
          />
          <Area
            type="monotone"
            dataKey="engagementRate"
            yAxisId="rate"
            stroke="var(--color-engagementRate)"
            fill="url(#fillEngagementRate)"
            strokeWidth={2}
            dot={false}
            name={chartConfig.engagementRate.label}
          />
          <ChartLegend content={<ChartLegendContent />} />
        </AreaChart>
      </ChartContainer>
    </div>
  )
}
