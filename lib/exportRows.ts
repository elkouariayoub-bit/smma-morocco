import { getKpis } from "@/lib/kpi"

/** Returns aligned rows for date range: date, engagement_rate, impressions, people */
export async function buildMetricRows(start: string, end: string) {
  const { engagementRate, impressions, people } = await getKpis({ start, end })

  const map = new Map<string, { engagement_rate?: number; impressions?: number; people?: number }>()
  for (const point of engagementRate) {
    map.set(point.label, {
      ...(map.get(point.label) ?? {}),
      engagement_rate: point.value,
    })
  }
  for (const point of impressions) {
    map.set(point.label, {
      ...(map.get(point.label) ?? {}),
      impressions: point.value,
    })
  }
  for (const point of people) {
    map.set(point.label, {
      ...(map.get(point.label) ?? {}),
      people: point.value,
    })
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, values]) => ({
      date,
      engagement_rate: values.engagement_rate ?? "",
      impressions: values.impressions ?? "",
      people: values.people ?? "",
    }))
}
