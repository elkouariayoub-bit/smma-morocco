export type KpiSeries = { label: string; value: number }[]

export async function fetchEngagementSeries(): Promise<KpiSeries> {
  // TODO: replace with real API/DB call
  // 7-day sample data
  return [
    { label: "Mon", value: 1800 },
    { label: "Tue", value: 2200 },
    { label: "Wed", value: 2100 },
    { label: "Thu", value: 2600 },
    { label: "Fri", value: 2400 },
    { label: "Sat", value: 2900 },
    { label: "Sun", value: 2700 },
  ]
}

export async function fetchAudienceGrowthSeries(): Promise<KpiSeries> {
  return [
    { label: "Mon", value: 280 },
    { label: "Tue", value: 360 },
    { label: "Wed", value: 330 },
    { label: "Thu", value: 420 },
    { label: "Fri", value: 390 },
    { label: "Sat", value: 520 },
    { label: "Sun", value: 480 },
  ]
}
