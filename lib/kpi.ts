export type KpiPoint = { label: string; value: number }
export type KpiSeries = KpiPoint[]

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

// Engagement rate in %
export async function fetchEngagementRateSeries(): Promise<KpiSeries> {
  return [
    { label: "Mon", value: 3.9 },
    { label: "Tue", value: 4.6 },
    { label: "Wed", value: 4.2 },
    { label: "Thu", value: 5.1 },
    { label: "Fri", value: 4.8 },
    { label: "Sat", value: 5.4 },
    { label: "Sun", value: 5.0 },
  ]
}

// Impressions (absolute numbers)
export async function fetchImpressionsSeries(): Promise<KpiSeries> {
  return [
    { label: "Mon", value: 12000 },
    { label: "Tue", value: 14500 },
    { label: "Wed", value: 13800 },
    { label: "Thu", value: 16100 },
    { label: "Fri", value: 15200 },
    { label: "Sat", value: 17800 },
    { label: "Sun", value: 16900 },
  ]
}

// People reached (absolute numbers)
export async function fetchPeopleSeries(): Promise<KpiSeries> {
  return [
    { label: "Mon", value: 5400 },
    { label: "Tue", value: 6100 },
    { label: "Wed", value: 5900 },
    { label: "Thu", value: 6800 },
    { label: "Fri", value: 6400 },
    { label: "Sat", value: 7200 },
    { label: "Sun", value: 7000 },
  ]
}
