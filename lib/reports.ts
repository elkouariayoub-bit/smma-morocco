import 'server-only'

import { unstable_cache } from 'next/cache'

import {
  CAMPAIGN_STATUSES,
  mapCampaign,
  type CampaignRow,
} from '@/lib/campaigns'
import { supabaseServer } from '@/lib/supabaseServer'
import type {
  CampaignStatus,
  ReportExportFormat,
  ReportFilters,
  ReportFilterStatus,
  ReportMetric,
  ReportPreview,
  ReportRow,
  ReportSeriesPoint,
} from '@/types'

const DEFAULT_RANGE_DAYS = 30

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function isIsoDate(value: string | null | undefined) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

export function buildDefaultReportFilters(): ReportFilters {
  const today = startOfDay(new Date())
  const start = new Date(today)
  start.setUTCDate(start.getUTCDate() - DEFAULT_RANGE_DAYS + 1)

  return {
    from: toISODate(start),
    to: toISODate(today),
    status: 'all',
    clientId: 'all',
  }
}

export function normalizeReportFilters(
  input: Partial<{ from?: string | null; to?: string | null; status?: string | null; clientId?: string | null }>,
): ReportFilters {
  const defaults = buildDefaultReportFilters()
  const from = isIsoDate(input.from)
    ? (input.from as string)
    : defaults.from
  const to = isIsoDate(input.to)
    ? (input.to as string)
    : defaults.to

  let normalizedFrom = from
  let normalizedTo = to

  if (new Date(from) > new Date(to)) {
    normalizedFrom = to
    normalizedTo = from
  }

  const status = normalizeStatus(input.status)
  const clientId = input.clientId && input.clientId !== 'all' ? input.clientId : 'all'

  return {
    from: normalizedFrom,
    to: normalizedTo,
    status,
    clientId,
  }
}

function normalizeStatus(value: string | null | undefined): ReportFilterStatus {
  if (!value || value === 'all') {
    return 'all'
  }

  return (CAMPAIGN_STATUSES.includes(value as CampaignStatus) ? value : 'all') as ReportFilterStatus
}

function seededNumber(seed: string) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash)
}

function computeCampaignRow(
  campaign: ReturnType<typeof mapCampaign>,
  filters: ReportFilters,
): Omit<ReportRow, 'id'> {
  const baseSeed = seededNumber(`${campaign.id}:${filters.from}:${filters.to}`)
  const impressions = 1800 + (baseSeed % 4200)
  const clicks = Math.max(40, Math.round(impressions * (0.02 + ((baseSeed % 90) / 5000))))
  const conversions = Math.max(3, Math.round(clicks * (0.08 + ((baseSeed % 7) / 120))))
  const spend = Number(((clicks * 3.75) + (baseSeed % 300)).toFixed(2))
  const revenue = conversions * 320 + (baseSeed % 180)
  const ctr = impressions ? Number(((clicks / impressions) * 100).toFixed(2)) : 0
  const roi = spend > 0 ? Number((((revenue - spend) / spend).toFixed(2))) : 0

  return {
    campaign: campaign.name,
    client: campaign.client_name ?? 'Unassigned',
    status: campaign.status,
    startDate: campaign.startDate,
    endDate: campaign.endDate ?? null,
    impressions,
    clicks,
    spend,
    ctr,
    conversions,
    roi,
  }
}

function combineSeries(seriesMap: Map<string, ReportSeriesPoint>): ReportSeriesPoint[] {
  return Array.from(seriesMap.values()).sort((a, b) => (a.date > b.date ? 1 : -1))
}

function buildSeriesKey(date: string | null, filters: ReportFilters) {
  if (!date) {
    return filters.from
  }
  if (date < filters.from) {
    return filters.from
  }
  if (date > filters.to) {
    return filters.to
  }
  return date
}

function uniqueClients(rows: Array<{ client_id: string | null; client_name?: string }>) {
  const seen = new Map<string | null, string>()
  for (const row of rows) {
    const key = row.client_id ?? null
    const label = row.client_name ?? 'Unassigned'
    if (!seen.has(key)) {
      seen.set(key, label)
    }
  }
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }))
}

function buildFallbackPreview(filters: ReportFilters): ReportPreview {
  const sampleRow: ReportRow = {
    id: 'sample',
    campaign: 'Sample Awareness Campaign',
    client: 'Demo Client',
    status: 'active',
    startDate: filters.from,
    endDate: filters.to,
    impressions: 2400,
    clicks: 210,
    spend: 4850,
    ctr: Number(((210 / 2400) * 100).toFixed(2)),
    conversions: 28,
    roi: Number((((28 * 320 - 4850) / 4850).toFixed(2))),
  }

  const sampleSeries: ReportSeriesPoint[] = Array.from({ length: 6 }).map((_, index) => {
    const date = new Date(filters.from)
    date.setUTCDate(date.getUTCDate() + index * 5)
    return {
      date: toISODate(date),
      spend: 3200 + index * 280,
      impressions: 2000 + index * 150,
      clicks: 180 + index * 20,
    }
  })

  return {
    filters,
    metrics: [
      { key: 'campaigns_total', label: 'Total campaigns', value: 1, unit: 'count' },
      { key: 'active_campaigns', label: 'Active', value: 1, unit: 'count', trend: 100 },
      { key: 'total_spend', label: 'Total spend', value: sampleRow.spend, unit: 'mad' },
      { key: 'average_ctr', label: 'Average CTR', value: sampleRow.ctr, unit: 'percentage' },
    ],
    statusBreakdown: [
      { status: 'planned', count: 0 },
      { status: 'active', count: 1 },
      { status: 'paused', count: 0 },
      { status: 'completed', count: 0 },
      { status: 'archived', count: 0 },
    ],
    rows: [sampleRow],
    series: sampleSeries,
    availableClients: [{ id: null, name: 'Demo Client' }],
    generatedAt: new Date().toISOString(),
    totalRows: 1,
    summary: {
      totalSpend: sampleRow.spend,
      totalImpressions: sampleRow.impressions,
      totalClicks: sampleRow.clicks,
      averageCtr: sampleRow.ctr,
      averageRoi: sampleRow.roi,
    },
  }
}

const cachedReportPreview = unstable_cache(
  async (userId: string, filters: ReportFilters): Promise<ReportPreview> => {
    try {
      const supabase = await supabaseServer()
      let statement = supabase
        .from('campaigns')
        .select(
          'id, user_id, client_id, name, description, status, start_date, end_date, position, milestones, metadata, created_at, updated_at, clients(name)',
        )
        .eq('user_id', userId)

      if (filters.clientId !== 'all') {
        statement = statement.eq('client_id', filters.clientId)
      }
      if (filters.status !== 'all') {
        statement = statement.eq('status', filters.status)
      }
      if (filters.from) {
        statement = statement.gte('start_date', filters.from)
      }
      if (filters.to) {
        statement = statement.lte('start_date', filters.to)
      }

      const { data, error } = await statement

      if (error) {
        console.error('Failed to load campaigns for reports', error)
        return buildFallbackPreview(filters)
      }

      const campaigns = (data ?? []).map((row) => mapCampaign(row as CampaignRow))

      if (!campaigns.length) {
        return buildFallbackPreview(filters)
      }

      const seriesMap = new Map<string, ReportSeriesPoint>()
      const rows: ReportRow[] = []
      let totalSpend = 0
      let totalImpressions = 0
      let totalClicks = 0
      let totalRoi = 0
      const statusTally = new Map<CampaignStatus, number>()

      for (const campaign of campaigns) {
        const rowMetrics = computeCampaignRow(campaign, filters)
        totalSpend += rowMetrics.spend
        totalImpressions += rowMetrics.impressions
        totalClicks += rowMetrics.clicks
        totalRoi += rowMetrics.roi

        const statusKey = campaign.status
        statusTally.set(statusKey, (statusTally.get(statusKey) ?? 0) + 1)

        const id = campaign.id
        rows.push({ id, ...rowMetrics })

        const key = buildSeriesKey(campaign.startDate ?? null, filters)
        const existing = seriesMap.get(key)
        if (existing) {
          existing.spend += rowMetrics.spend
          existing.impressions += rowMetrics.impressions
          existing.clicks += rowMetrics.clicks
        } else {
          seriesMap.set(key, {
            date: key,
            spend: rowMetrics.spend,
            impressions: rowMetrics.impressions,
            clicks: rowMetrics.clicks,
          })
        }
      }

      const averageCtr = totalImpressions ? Number(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0
      const averageRoi = rows.length ? Number((totalRoi / rows.length).toFixed(2)) : 0

      const metrics: ReportMetric[] = [
        { key: 'campaigns_total', label: 'Total campaigns', value: rows.length, unit: 'count' },
        {
          key: 'active_campaigns',
          label: 'Active',
          value: statusTally.get('active') ?? 0,
          unit: 'count',
          trend: rows.length ? Math.round(((statusTally.get('active') ?? 0) / rows.length) * 100) : 0,
        },
        { key: 'total_spend', label: 'Total spend', value: Number(totalSpend.toFixed(2)), unit: 'mad' },
        { key: 'average_ctr', label: 'Average CTR', value: averageCtr, unit: 'percentage' },
      ]

      const statusBreakdown = CAMPAIGN_STATUSES.map((status) => ({
        status,
        count: statusTally.get(status) ?? 0,
      }))

      rows.sort((a, b) => b.spend - a.spend)

      return {
        filters,
        metrics,
        statusBreakdown,
        rows,
        series: combineSeries(seriesMap),
        availableClients: uniqueClients(campaigns),
        generatedAt: new Date().toISOString(),
        totalRows: rows.length,
        summary: {
          totalSpend: Number(totalSpend.toFixed(2)),
          totalImpressions,
          totalClicks,
          averageCtr,
          averageRoi,
        },
      }
    } catch (error) {
      console.error('Unable to generate report preview', error)
      return buildFallbackPreview(filters)
    }
  },
  ['reports-preview'],
  { revalidate: 300, tags: ['reports-preview'] },
)

export async function getReportPreview(
  input: Partial<{ from?: string | null; to?: string | null; status?: string | null; clientId?: string | null }>,
  options: { userId?: string | null } = {},
): Promise<ReportPreview> {
  const filters = normalizeReportFilters(input)

  if (!options.userId) {
    return buildFallbackPreview(filters)
  }

  return cachedReportPreview(options.userId, filters)
}

export async function recordReportExport(format: ReportExportFormat, userId: string) {
  try {
    const supabase = await supabaseServer()
    await supabase.from('dashboard_events').insert({
      event_name: 'report_exported',
      user_id: userId,
      metadata: { format },
    })
  } catch (error) {
    console.error('Failed to record report export event', error)
  }
}
