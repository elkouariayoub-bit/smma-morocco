"use client"

import KpiChart, { KpiChartProps, KpiPoint } from "./KpiChart"

export default function AudienceChartClient(
  props: { data: KpiPoint[] } & Partial<KpiChartProps>,
) {
  return <KpiChart {...props} />
}
