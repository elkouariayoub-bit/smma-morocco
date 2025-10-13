'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { ReportSeriesPoint } from '@/types'

type ReportChartProps = {
  data: ReportSeriesPoint[]
  isLoading?: boolean
}

export function ReportChart({ data, isLoading = false }: ReportChartProps) {
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
    [data],
  )

  if (!chartData.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Select filters to see your report preview
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4 shadow-sm dark:border-zinc-800">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} role="img" aria-label="Campaign spend trend">
          <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
          <XAxis dataKey="label" stroke="rgba(255,255,255,0.64)" tickLine={false} axisLine={false} dy={6} />
          <YAxis stroke="rgba(255,255,255,0.64)" tickLine={false} axisLine={false} dx={-6} allowDecimals={false} />
          <Tooltip
            cursor={{ stroke: '#fbbf24', strokeWidth: 1 }}
            contentStyle={{
              background: '#111827',
              borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'white',
            }}
            labelClassName="text-xs font-medium"
          />
          <Area
            type="monotone"
            dataKey="spend"
            stroke="#fbbf24"
            strokeWidth={2.5}
            fill="url(#report-spend-gradient)"
            isAnimationActive={!prefersReducedMotion && !isLoading}
          />
          <defs>
            <linearGradient id="report-spend-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.05} />
            </linearGradient>
          </defs>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
