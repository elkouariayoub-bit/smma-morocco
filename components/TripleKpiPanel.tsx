"use client"

import KpiChart, { KpiPoint } from "@/components/KpiChart"

type BlockProps = {
  title: string
  value: string
  sub: string
  colorClass: string // controls chart stroke via currentColor
  data: KpiPoint[]
}

function KpiBlock({ title, value, sub, colorClass, data }: BlockProps) {
  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">{title}</h4>
      <p className="text-xs text-gray-500 dark:text-gray-400">{sub}</p>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">{value}</div>
      <div className={`mt-4 ${colorClass}`}>
        <KpiChart data={data} />
      </div>
    </div>
  )
}

export default function TripleKpiPanel({
  engagementRate,
  impressions,
  people,
}: {
  engagementRate: KpiPoint[]
  impressions: KpiPoint[]
  people: KpiPoint[]
}) {
  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Key Metrics</h3>

      {/* 3 cards inside ONE container, same visual style as before */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <KpiBlock
          title="Engagement rate"
          sub="7-day average"
          value="5.0%"
          colorClass="text-emerald-500 dark:text-emerald-300"
          data={engagementRate}
        />
        <KpiBlock
          title="Impressions"
          sub="Last 7 days"
          value="16.9K"
          colorClass="text-blue-600 dark:text-blue-300"
          data={impressions}
        />
        <KpiBlock
          title="People"
          sub="Reached last 7 days"
          value="7.0K"
          colorClass="text-violet-600 dark:text-violet-300"
          data={people}
        />
      </div>
    </section>
  )
}
