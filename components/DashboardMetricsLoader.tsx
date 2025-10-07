"use client"

import useSWR from "swr"

import { useDateRange } from "@/app/providers/date-range"
import TripleKpiPanel from "@/components/TripleKpiPanel.client"
import type { KpiSeries } from "@/lib/kpi"

type KpiResponse = {
  current: {
    engagementRate: KpiSeries
    impressions: KpiSeries
    people: KpiSeries
  }
  previous?: {
    engagementRate: KpiSeries
    impressions: KpiSeries
    people: KpiSeries
  } | null
}

const fetcher = async (url: string): Promise<KpiResponse> => {
  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }
  return response.json()
}

export default function DashboardMetricsLoader() {
  const { range } = useDateRange()

  const hasRange = Boolean(range.start && range.end)
  const params = new URLSearchParams()

  if (hasRange) {
    params.set("start", range.start)
    params.set("end", range.end)
    if (range.compare) {
      params.set("compare", "1")
    }
  }

  const key = hasRange ? `/api/kpis?${params.toString()}` : null
  const { data, isLoading, error } = useSWR<KpiResponse>(key, fetcher, {
    revalidateOnFocus: false,
  })

  if (!hasRange) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-gray-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-gray-300">
        Select a valid date range to load metrics.
      </div>
    )
  }

  if (isLoading) {
    return <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">Loading metrics…</div>
  }

  if (error || !data?.current) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white p-6 text-sm text-rose-600 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-rose-400">
        Failed to load metrics.
      </div>
    )
  }

  const { current, previous } = data

  return (
    <TripleKpiPanel
      engagementRate={current.engagementRate}
      impressions={current.impressions}
      people={current.people}
      engagementRatePrev={previous?.engagementRate ?? null}
      impressionsPrev={previous?.impressions ?? null}
      peoplePrev={previous?.people ?? null}
    />
  )
}
