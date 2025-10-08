"use client"

import KpiChart, { type KpiChartProps, type KpiPoint } from "./KpiChart"

export default function EngagementChartClient(
  props: { data: KpiPoint[] } & Partial<KpiChartProps>,
) {
  return <KpiChart {...props} />
}
