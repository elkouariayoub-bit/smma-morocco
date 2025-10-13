'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { DashboardSeriesPoint } from '@/types'

interface TrendChartProps {
  data: DashboardSeriesPoint[]
  isLoading?: boolean
}

export function TrendChart({ data, isLoading = false }: TrendChartProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    handleChange()
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  const chartData = useMemo(
    () =>
      data.map((point) => ({
        ...point,
        label: new Intl.DateTimeFormat(undefined, {
          month: 'short',
          day: 'numeric',
        }).format(new Date(point.date)),
      })),
    [data]
  )

  if (!chartData.length) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        No data yet
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 shadow-sm dark:border-zinc-800">
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData} role="img" aria-label="Client growth over time">
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.64)" tickLine={false} axisLine={false} dy={6} />
          <YAxis stroke="rgba(255,255,255,0.64)" tickLine={false} axisLine={false} dx={-6} allowDecimals={false} />
          <Tooltip
            cursor={{ stroke: '#ff4081', strokeWidth: 1 }}
            contentStyle={{
              background: '#111827',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
            labelClassName="text-xs font-medium"
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#ff4081"
            strokeWidth={2.5}
            dot={{ r: 4, fill: '#ff4081', stroke: '#1f2937', strokeWidth: 1 }}
            isAnimationActive={!prefersReducedMotion && !isLoading}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
