'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Download, Filter, Loader2, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ReportChart } from './report-chart'
import { CAMPAIGN_STATUSES } from '@/lib/campaigns'
import type { ReportExportFormat, ReportFilters, ReportMetric, ReportPreview, ReportRow } from '@/types'
import { simulateExport } from '@/stubs/export'

interface ReportsClientProps {
  initialPreview: ReportPreview
}

const MAD_FORMATTER = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'MAD',
  maximumFractionDigits: 2,
})

const PERCENT_FORMATTER = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

export function ReportsClient({ initialPreview }: ReportsClientProps) {
  const [preview, setPreview] = useState<ReportPreview>(initialPreview)
  const [filters, setFilters] = useState<ReportFilters>(initialPreview.filters)
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(initialPreview.filters)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  const clientOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const option of preview.availableClients) {
      if (option.id && !seen.has(option.id)) {
        seen.set(option.id, option.name)
      }
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
  }, [preview.availableClients])

  useEffect(() => {
    setAnnouncement(`Report generated with ${preview.totalRows} campaign${preview.totalRows === 1 ? '' : 's'}.`)
  }, [preview.generatedAt, preview.totalRows])

  const handleDraftChange = useCallback(
    (patch: Partial<ReportFilters>) => {
      setDraftFilters((previous) => ({ ...previous, ...patch }))
    },
    [],
  )

  const handleRefresh = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setError(null)
      setStatusMessage(null)
      setIsRefreshing(true)

      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const params = new URLSearchParams({ type: 'preview' })
        params.set('params', JSON.stringify(draftFilters))
        const response = await fetch(`/api/reports?${params.toString()}`, { signal: controller.signal })

        if (!response.ok) {
          throw new Error('Failed to refresh report preview')
        }

        const payload = (await response.json()) as { report: ReportPreview }
        setPreview(payload.report)
        setFilters(payload.report.filters)
        setDraftFilters(payload.report.filters)
        setStatusMessage('Report preview refreshed')
      } catch (requestError) {
        if ((requestError as Error).name === 'AbortError') {
          return
        }
        console.error('Unable to refresh report preview', requestError)
        setError('Unable to refresh the report preview. Please try again.')
      } finally {
        setIsRefreshing(false)
      }
    },
    [draftFilters],
  )

  const handleExport = useCallback(
    async (format: ReportExportFormat) => {
      setExporting(format)
      setError(null)
      setStatusMessage(null)

      try {
        const params = new URLSearchParams({ type: format })
        params.set('params', JSON.stringify(filters))

        const response = await fetch(`/api/reports?${params.toString()}`)

        if (!response.ok) {
          throw new Error(`Failed to export report as ${format}`)
        }

        const blob = await response.blob()
        const downloadUrl = URL.createObjectURL(blob)
        const filename = extractFileName(response.headers.get('Content-Disposition'), format, filters)

        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = filename
        link.setAttribute('aria-label', `Download ${format.toUpperCase()} report`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(downloadUrl)

        setStatusMessage(`Report exported as ${format.toUpperCase()}`)
      } catch (requestError) {
        console.error('Unable to export report', requestError)
        setError(`Unable to export the report as ${format.toUpperCase()}. Showing simulated output.`)
        await simulateExport(format)
      } finally {
        setExporting(null)
      }
    },
    [filters],
  )

  const metrics = preview.metrics
  const rows = preview.rows

  const statusTotals = preview.statusBreakdown.reduce((acc, item) => acc + item.count, 0)

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(260px,280px)_minmax(0,1fr)]">
      <form
        onSubmit={handleRefresh}
        className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900"
        aria-labelledby="report-filters-heading"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 id="report-filters-heading" className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              Filters
            </h2>
            <p className="text-xs text-muted-foreground">Choose a reporting window and focus area.</p>
          </div>
          <Filter className="h-5 w-5 text-[#fbbf24]" aria-hidden="true" />
        </div>

        <div className="space-y-3">
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>From</span>
            <Input
              type="date"
              aria-label="Report start date"
              value={draftFilters.from}
              max={draftFilters.to}
              onChange={(event) => handleDraftChange({ from: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>To</span>
            <Input
              type="date"
              aria-label="Report end date"
              value={draftFilters.to}
              min={draftFilters.from}
              onChange={(event) => handleDraftChange({ to: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>Status</span>
            <select
              aria-label="Campaign status filter"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] dark:border-gray-700 dark:bg-gray-950"
              value={draftFilters.status}
              onChange={(event) => handleDraftChange({ status: event.target.value as ReportFilters['status'] })}
            >
              <option value="all">All statuses</option>
              {CAMPAIGN_STATUSES.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            <span>Client</span>
            <select
              aria-label="Client filter"
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fbbf24] dark:border-gray-700 dark:bg-gray-950"
              value={draftFilters.clientId}
              onChange={(event) => handleDraftChange({ clientId: event.target.value as ReportFilters['clientId'] })}
            >
              <option value="all">All clients</option>
              {clientOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Button type="submit" className="mt-2 flex items-center gap-2" disabled={isRefreshing}>
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" />}
          Refresh preview
        </Button>

        <div className="mt-2 grid gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="flex items-center gap-2 border-[#fbbf24]/40 text-sm text-gray-900 hover:border-[#fbbf24] hover:bg-[#fbbf24]/10 dark:text-gray-100"
            aria-label="Download CSV report"
          >
            {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="flex items-center gap-2 border-[#fbbf24]/40 text-sm text-gray-900 hover:border-[#fbbf24] hover:bg-[#fbbf24]/10 dark:text-gray-100"
            aria-label="Download PDF report"
          >
            {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" />}
            Export PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={exporting !== null}
            className="flex items-center gap-2 border-[#fbbf24]/40 text-sm text-gray-900 hover:border-[#fbbf24] hover:bg-[#fbbf24]/10 dark:text-gray-100"
            aria-label="Download Excel report"
          >
            {exporting === 'excel' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" />}
            Export Excel
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Credentials stay server-side. Exports generate within one second for standard reports.
        </p>
      </form>

      <div className="flex flex-col gap-6">
        <div className="sr-only" aria-live="polite">
          {announcement}
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800/60 dark:bg-red-900/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {statusMessage ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/40 dark:text-emerald-100">
            {statusMessage}
          </div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.key} metric={metric} />
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)]">
          <ReportChart data={preview.series} isLoading={isRefreshing} />

          <Card className="h-full bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">Status distribution</CardTitle>
              <CardDescription>Monitor campaign lifecycle health across your workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {preview.statusBreakdown.map((item) => (
                <div key={item.status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-700 dark:text-gray-200">{item.status}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.count} {item.count === 1 ? 'campaign' : 'campaigns'}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-[#fbbf24]"
                      style={{
                        width: `${statusTotals ? Math.round((item.count / Math.max(statusTotals, 1)) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 dark:border-gray-800 dark:text-gray-200">
            <span>Report preview</span>
            <span className="text-xs text-muted-foreground">
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              }).format(new Date(preview.generatedAt))}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-950">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Campaign
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Client
                  </th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">
                    Spend (MAD)
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">
                    CTR
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">
                    Conversions
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-200">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      Select filters to generate your first report.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => <ReportRowItem key={row.id} row={row} />)
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  )
}

function MetricCard({ metric }: { metric: ReportMetric }) {
  const formatted = formatMetric(metric)
  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="space-y-2">
        <CardDescription className="text-xs font-medium uppercase tracking-[0.18em] text-[#fbbf24]">
          {metric.label}
        </CardDescription>
        <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-gray-50">{formatted}</CardTitle>
        {typeof metric.trend === 'number' ? (
          <p className="text-xs text-muted-foreground">{metric.trend}% of campaigns</p>
        ) : null}
      </CardHeader>
    </Card>
  )
}

function ReportRowItem({ row }: { row: ReportRow }) {
  return (
    <tr className="hover:bg-gray-50 focus-within:bg-gray-50 dark:hover:bg-gray-950 dark:focus-within:bg-gray-950">
      <th scope="row" className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">
        {row.campaign}
      </th>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{row.client}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium capitalize',
            row.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
              : row.status === 'completed'
              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300'
              : 'bg-gray-500/10 text-gray-600 dark:text-gray-300',
          )}
        >
          {row.status}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">{MAD_FORMATTER.format(row.spend)}</td>
      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{row.ctr.toFixed(2)}%</td>
      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{row.conversions}</td>
      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{row.roi.toFixed(2)}</td>
    </tr>
  )
}

function formatMetric(metric: ReportMetric) {
  if (metric.unit === 'mad') {
    return MAD_FORMATTER.format(metric.value)
  }
  if (metric.unit === 'percentage') {
    return PERCENT_FORMATTER.format(metric.value / 100)
  }
  return metric.value.toLocaleString()
}

function extractFileName(header: string | null, format: ReportExportFormat, filters: ReportFilters) {
  if (header) {
    const match = /filename="?(?<filename>[^";]+)"?/i.exec(header)
    if (match?.groups?.filename) {
      return match.groups.filename
    }
  }
  const extension = format === 'excel' ? 'xlsx' : format
  return `smma-report-${filters.from}-${filters.to}.${extension}`
}
