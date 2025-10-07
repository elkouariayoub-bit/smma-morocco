"use client"

import { useMemo } from "react"

import { useDateRange } from "@/app/providers/date-range"
import KpiChart from "@/components/KpiChart"
import type { KpiSeries, Range } from "@/lib/kpi"
import { previousRange } from "@/lib/kpi"

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
})

type MetricDelta = { label: string; positive: boolean }

type MetricConfig = {
  title: string
  value: string
  sub: string
  colorClass: string
  data: KpiSeries
  comparison?: KpiSeries
  delta?: MetricDelta
}

export type TripleKpiPanelProps = {
  engagementRate: KpiSeries
  impressions: KpiSeries
  people: KpiSeries
  engagementRatePrev?: KpiSeries | null
  impressionsPrev?: KpiSeries | null
  peoplePrev?: KpiSeries | null
}

function formatDateRange(range: Range) {
  const start = dateFormatter.format(new Date(range.start))
  const end = dateFormatter.format(new Date(range.end))
  return start === end ? start : `${start} – ${end}`
}

function createDelta(value: number, formatter: (input: number) => string, suffix = ""): MetricDelta {
  const positive = value >= 0
  const formatted = formatter(Math.abs(value))
  const sign = positive ? "+" : "-"
  const suffixLabel = suffix ? ` ${suffix}` : ""
  return { label: `${sign}${formatted}${suffixLabel} vs prev`, positive }
}

function average(series: KpiSeries) {
  if (!series.length) return 0
  return series.reduce((acc, point) => acc + point.value, 0) / series.length
}

function total(series: KpiSeries) {
  return series.reduce((acc, point) => acc + point.value, 0)
}

export default function TripleKpiPanel({
  engagementRate,
  impressions,
  people,
  engagementRatePrev,
  impressionsPrev,
  peoplePrev,
}: TripleKpiPanelProps) {
  const { range } = useDateRange()

  const metrics = useMemo<MetricConfig[]>(() => {
    const activeRange: Range = { start: range.start, end: range.end }
    const rangeLabel = `Range: ${formatDateRange(activeRange)}`
    const previousLabel = range.compare
      ? `Previous: ${formatDateRange(previousRange(activeRange))}`
      : undefined

    const engagementSeries = engagementRate ?? []
    const impressionsSeries = impressions ?? []
    const peopleSeries = people ?? []

    const engagementPrevSeries = engagementRatePrev ?? undefined
    const impressionsPrevSeries = impressionsPrev ?? undefined
    const peoplePrevSeries = peoplePrev ?? undefined

    const engagementComparison = engagementPrevSeries && engagementPrevSeries.length > 0 ? engagementPrevSeries : undefined
    const impressionsComparison = impressionsPrevSeries && impressionsPrevSeries.length > 0 ? impressionsPrevSeries : undefined
    const peopleComparison = peoplePrevSeries && peoplePrevSeries.length > 0 ? peoplePrevSeries : undefined

    const engagementAvg = average(engagementSeries)
    const impressionsTotal = total(impressionsSeries)
    const peopleTotal = total(peopleSeries)

    const metricsList: MetricConfig[] = [
      {
        title: "Engagement rate",
        sub: previousLabel ? `${rangeLabel} · ${previousLabel}` : rangeLabel,
        value: `${percentFormatter.format(engagementAvg)}%`,
        colorClass: "text-emerald-500 dark:text-emerald-300",
        data: engagementSeries,
        comparison: engagementComparison,
        delta:
          range.compare && engagementComparison
            ? createDelta(
                engagementAvg - average(engagementComparison),
                (value) => percentFormatter.format(value),
                "pts",
              )
            : undefined,
      },
      {
        title: "Impressions",
        sub: previousLabel ? `${rangeLabel} · ${previousLabel}` : rangeLabel,
        value: compactNumber.format(impressionsTotal),
        colorClass: "text-blue-600 dark:text-blue-300",
        data: impressionsSeries,
        comparison: impressionsComparison,
        delta:
          range.compare && impressionsComparison
            ? createDelta(
                impressionsTotal - total(impressionsComparison),
                (value) => compactNumber.format(value),
              )
            : undefined,
      },
      {
        title: "People reached",
        sub: previousLabel ? `${rangeLabel} · ${previousLabel}` : rangeLabel,
        value: compactNumber.format(peopleTotal),
        colorClass: "text-violet-600 dark:text-violet-300",
        data: peopleSeries,
        comparison: peopleComparison,
        delta:
          range.compare && peopleComparison
            ? createDelta(
                peopleTotal - total(peopleComparison),
                (value) => compactNumber.format(value),
              )
            : undefined,
      },
    ]

    return metricsList
  }, [
    engagementRate,
    impressions,
    people,
    engagementRatePrev,
    impressionsPrev,
    peoplePrev,
    range.start,
    range.end,
    range.compare,
  ])

  const hasData = metrics.some((metric) => metric.data.length > 0)

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Key Metrics</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDateRange({ start: range.start, end: range.end })}
        </p>
      </div>

      {hasData ? (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {metrics.map((metric) => (
            <MetricBlock key={metric.title} metric={metric} />
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          No metrics available for the selected range.
        </p>
      )}
    </section>
  )
}

type MetricBlockProps = {
  metric: MetricConfig
}

function MetricBlock({ metric }: MetricBlockProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-colors hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900">
      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{metric.title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">{metric.sub}</p>
      <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{metric.value}</div>
      {metric.delta ? (
        <div
          className={`mt-2 text-sm font-medium ${
            metric.delta.positive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-500 dark:text-rose-400"
          }`}
        >
          {metric.delta.label}
        </div>
      ) : null}
      <div className={`mt-4 ${metric.colorClass}`}>
        <KpiChart data={metric.data} comparison={metric.comparison} />
      </div>
    </div>
  )
}
