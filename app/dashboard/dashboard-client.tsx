'use client'

import { useCallback, useEffect, useMemo, useState, startTransition } from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

import { MetricCard } from '@/components/dashboard/MetricCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { Button } from '@/components/ui/button'
import { useDashboardMetricsStore } from '@/hooks/useDashboardMetricsStore'
import type { DashboardFilterPreset, DashboardMetricsResponse } from '@/types'

const TrendChart = dynamic(() => import('@/components/dashboard/TrendChart').then((mod) => mod.TrendChart), {
  ssr: false,
  loading: () => <ChartSkeleton />,
})

interface DashboardClientProps {
  initialMetrics: DashboardMetricsResponse
  initialFilter: DashboardFilterPreset
}

const FILTER_OPTIONS: Array<{ value: DashboardFilterPreset; label: string }> = [
  { value: 'last_7_days', label: 'Last 7 days' },
  { value: 'last_30_days', label: 'Last 30 days' },
  { value: 'last_90_days', label: 'Last 90 days' },
]

function ChartSkeleton() {
  return (
    <div className="flex h-80 w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
      Loading trend…
    </div>
  )
}

function MetricSkeleton() {
  return (
    <div className="h-40 animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800" />
  )
}

export function DashboardClient({ initialMetrics, initialFilter }: DashboardClientProps) {
  const { filter, data, status, error, setFilter, setData, setLoading, setError, hydrate } =
    useDashboardMetricsStore()
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    hydrate({ filter: initialFilter, data: initialMetrics })
  }, [hydrate, initialFilter, initialMetrics])

  useEffect(() => {
    if (!actionMessage) return
    const timeout = window.setTimeout(() => setActionMessage(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [actionMessage])

  const metrics = data ?? initialMetrics

  const summaryText = useMemo(
    () =>
      `Tracking ${metrics.clients} clients across ${metrics.campaigns} active campaigns as of ${new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
      }).format(new Date(metrics.generatedAt))}.`,
    [metrics]
  )

  const handleFilterChange = useCallback(
    async (value: DashboardFilterPreset) => {
      if (value === filter && status === 'success') return
      setFilter(value)
      setLoading()
      try {
        const response = await fetch(`/api/metrics?preset=${value}`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'include',
        })

        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error ?? 'Unable to load metrics')
        }

        const payload = (await response.json()) as DashboardMetricsResponse
        startTransition(() => {
          setData(payload)
        })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to load metrics'
        setError(message)
      }
    },
    [filter, setData, setError, setFilter, setLoading, status]
  )

  const onRetry = useCallback(() => {
    void handleFilterChange(filter)
  }, [handleFilterChange, filter])

  const onAction = useCallback((actionKey: string) => {
    setActionMessage(
      actionKey === 'new-campaign'
        ? 'Opening campaign composer…'
        : actionKey === 'invite-client'
          ? 'Generating invite link…'
          : 'Compiling your latest report…'
    )
  }, [])

  const skeletonCount = metrics.metrics.length || 2

  const metricsContent = status === 'loading'
    ? Array.from({ length: skeletonCount }, (_, index) => <MetricSkeleton key={index} />)
    : metrics.metrics.map((metric) => (
        <MetricCard
          key={metric.key}
          title={metric.key === 'clients' ? 'Clients' : 'Campaigns'}
          value={new Intl.NumberFormat().format(metric.value)}
          change={metric.change}
          description={metric.key === 'clients' ? 'Active retainers and brand partners' : 'Live paid and organic campaigns'}
        />
      ))

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Dashboard overview</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Monitor growth and campaign momentum across every managed account.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Filter range</span>
          <select
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm transition focus:border-[#ff4081] focus:outline-none focus:ring-2 focus:ring-[#ff4081] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            value={filter}
            onChange={(event) => handleFilterChange(event.target.value as DashboardFilterPreset)}
            aria-label="Filter dashboard metrics"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {summaryText}
      </div>

      {status === 'error' ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200" role="alert">
          <p className="text-sm font-medium">{error}</p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 border-[#ff4081] text-[#ff4081] hover:bg-[#ff4081]/10 focus-visible:ring-[#ff4081]"
            onClick={onRetry}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
            role="list"
            aria-label="Key metrics"
          >
            {metricsContent}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Client growth</h2>
              {status === 'loading' ? (
                <span className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Updating…
                </span>
              ) : null}
            </div>
            <TrendChart data={metrics.series} isLoading={status === 'loading'} />
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Quick actions</h2>
            <QuickActions onAction={onAction} />
            {actionMessage ? (
              <div role="status" aria-live="polite" className="text-sm text-zinc-500 dark:text-zinc-400">
                {actionMessage}
              </div>
            ) : null}
          </div>
        </>
      )}
    </section>
  )
}
