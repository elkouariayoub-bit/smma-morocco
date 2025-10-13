import "server-only"

import { unstable_cache } from "next/cache"

import type {
  DashboardFilterPreset,
  DashboardMetric,
  DashboardMetricsResponse,
} from "@/types"
import { supabaseServer } from "@/lib/supabaseServer"

export interface DashboardMetricsQuery {
  from: string
  to: string
}

const FALLBACK_METRICS: DashboardMetricsResponse = {
  clients: 0,
  campaigns: 0,
  metrics: [
    { key: "clients", value: 0, change: 0 },
    { key: "campaigns", value: 0, change: 0 },
  ],
  series: [],
  generatedAt: new Date(0).toISOString(),
}

const cachedFetcher = unstable_cache(
  async ({ from, to }: DashboardMetricsQuery) => {
    try {
      const supabase = await supabaseServer()

      const { data: metricsRows, error: metricsError } = await supabase
        .from("dashboard_metrics")
        .select("key,value,change")
        .order("key")

      if (metricsError) {
        console.error("Failed to load dashboard metrics", metricsError)
      }

      const metrics: DashboardMetric[] = (metricsRows ?? []).map((row) => ({
        key: row.key,
        value: Number(row.value) ?? 0,
        change: Number(row.change) ?? 0,
      }))

      const summary = metrics.reduce(
        (acc, metric) => {
          if (metric.key === "clients") {
            acc.clients = metric.value
          }
          if (metric.key === "campaigns") {
            acc.campaigns = metric.value
          }
          return acc
        },
        { clients: 0, campaigns: 0 }
      )

      const { data: seriesRows, error: seriesError } = await supabase
        .from("dashboard_metric_series")
        .select("metric_key,data_date,value")
        .gte("data_date", from)
        .lte("data_date", to)
        .order("data_date")

      if (seriesError) {
        console.error("Failed to load dashboard series", seriesError)
      }

      const series = (seriesRows ?? [])
        .filter((row) => row.metric_key === "clients")
        .map((row) => ({
          metric: row.metric_key,
          date: row.data_date,
          value: Number(row.value) ?? 0,
        }))

      return {
        clients: summary.clients,
        campaigns: summary.campaigns,
        metrics: metrics.length ? metrics : FALLBACK_METRICS.metrics,
        series,
        generatedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Unable to query Supabase metrics", error)
      return { ...FALLBACK_METRICS, generatedAt: new Date().toISOString() }
    }
  },
  ["dashboard-metrics"],
  { revalidate: 300, tags: ["dashboard-metrics"] }
)

export async function getDashboardMetrics(params: DashboardMetricsQuery) {
  return cachedFetcher(params)
}

export function buildFilterRange(
  preset: DashboardFilterPreset,
  anchor: Date = new Date()
): DashboardMetricsQuery & { preset: DashboardFilterPreset } {
  const end = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()))
  const days =
    preset === "last_30_days" ? 29 : preset === "last_90_days" ? 89 : 6
  const start = new Date(end)
  start.setUTCDate(end.getUTCDate() - days)

  return {
    preset,
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  }
}

export function normalizeRange({
  from,
  to,
}: Partial<{ from: string | null | undefined; to: string | null | undefined }>): DashboardMetricsQuery {
  const today = new Date()
  const toValue = to ?? undefined
  const fromValue = from ?? undefined
  const end = toValue && isIsoDate(toValue) ? toValue : today.toISOString().slice(0, 10)
  const fallbackStart = buildFilterRange("last_7_days").from
  const start = fromValue && isIsoDate(fromValue) ? fromValue : fallbackStart

  return { from: start, to: end }
}

export async function recordDashboardEvent(
  eventName: "dashboard_view" | "metric_filter_applied",
  metadata: Record<string, unknown>,
  userId: string
) {
  try {
    const supabase = await supabaseServer()
    await supabase.from("dashboard_events").insert({
      event_name: eventName,
      metadata,
      user_id: userId,
    })
  } catch (error) {
    console.error("Failed to record dashboard event", error)
  }
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}
