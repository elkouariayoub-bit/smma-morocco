"use client"

import { memo } from "react"
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
  XAxis,
  CartesianGrid,
} from "recharts"

export type KpiPoint = { label: string; value: number }

export type KpiChartProps = {
  data: KpiPoint[]
  height?: number
  showGrid?: boolean
  showAxis?: boolean
  strokeWidth?: number
  ariaLabel?: string
}

function formatNumber(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function KpiChartBase({
  data,
  height = 160,
  showGrid = false,
  showAxis = false,
  strokeWidth = 2,
  ariaLabel = "KPI Trend",
}: KpiChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} aria-label={ariaLabel}>
          {showAxis ? (
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          ) : (
            <XAxis dataKey="label" hide />
          )}
          {showAxis ? (
            <YAxis tick={{ fontSize: 12 }} tickFormatter={formatNumber} />
          ) : (
            <YAxis hide />
          )}
          {showGrid ? <CartesianGrid vertical={false} strokeOpacity={0.15} /> : null}
          <Tooltip
            formatter={(val: number) => [formatNumber(val), "Value"]}
            labelStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export const KpiChart = memo(KpiChartBase)

export default KpiChart
