"use client";

import KpiChart, { KpiPoint, KpiChartProps } from "@/components/KpiChart";

type Props = {
  engagementSeries: KpiPoint[];
  audienceSeries: KpiPoint[];
};

export default function DashboardKpisClient({ engagementSeries, audienceSeries }: Props) {
  return (
    <>
      {/* Audience Growth card WITH sparkline */}
      <section className="rounded-2xl border bg-white p-6 dark:bg-neutral-900 lg:col-span-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Audience Growth</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">↑ 5.2% vs last week</p>
            <div className="mt-2 text-3xl font-bold">+2.4K</div>
          </div>
        </div>
        <div className="mt-4 text-blue-600 dark:text-blue-400">
          <KpiChart data={audienceSeries} />
        </div>
      </section>

      {/* Engagement card WITH sparkline */}
      <section className="rounded-2xl border bg-white p-6 dark:bg-neutral-900 lg:col-span-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Engagement</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Likes, comments, shares</p>
            <div className="mt-2 text-3xl font-bold">+14.7K</div>
          </div>
        </div>
        <div className="mt-4 text-emerald-600 dark:text-emerald-400">
          <KpiChart data={engagementSeries} />
        </div>
      </section>

      {/* Optional: Full-width trend below the cards */}
      <section className="rounded-2xl border bg-white p-6 dark:bg-neutral-900 lg:col-span-12">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Engagement Trend (7 days)</h3>
        </div>
        <div className="text-emerald-600 dark:text-emerald-400">
          <KpiChart data={engagementSeries} height={240} showGrid showAxis strokeWidth={3 as KpiChartProps["strokeWidth"]} />
        </div>
      </section>
    </>
  );
}
