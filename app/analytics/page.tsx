import AreaPanel from "@/components/dashboard/AreaPanel";
import BarPanel from "@/components/dashboard/BarPanel";
import DateRangeToolbar from "@/components/DateRangeToolbar";
import StatCard from "@/components/dashboard/StatCard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const revalidate = 3600; // Revalidate hourly

type Snapshot = {
  impressions: number | null;
  likes: number | null;
  comments: number | null;
};

function toSeries(rows: Snapshot[], key: keyof Snapshot) {
  return rows.map((row) => ({ v: Math.max(0, row[key] ?? 0) }));
}

function toDelta(series: { v: number }[]) {
  if (series.length < 2) {
    return undefined;
  }
  const first = series[0].v;
  const last = series[series.length - 1].v;
  if (!Number.isFinite(first) || !Number.isFinite(last)) {
    return undefined;
  }
  const baseline = Math.abs(first) > 1 ? Math.abs(first) : Math.max(Math.abs(last), 1);
  if (baseline === 0) {
    return undefined;
  }
  const change = ((last - first) / baseline) * 100;
  if (!Number.isFinite(change) || Math.abs(change) < 0.1) {
    return undefined;
  }
  const arrow = change > 0 ? "▲" : "▼";
  const sign = change > 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}% ${arrow}`;
}

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("impressions, likes, comments");

  const rows: Snapshot[] = data ?? [];

  const totals = rows.reduce<{ impressions: number; likes: number; comments: number }>(
    (acc, row) => ({
      impressions: acc.impressions + (row.impressions ?? 0),
      likes: acc.likes + (row.likes ?? 0),
      comments: acc.comments + (row.comments ?? 0),
    }),
    { impressions: 0, likes: 0, comments: 0 }
  );

  const impressionsSeries = toSeries(rows, "impressions");
  const likesSeries = toSeries(rows, "likes");
  const commentsSeries = toSeries(rows, "comments");

  const metrics = [
    {
      label: "Impressions",
      value: totals.impressions.toLocaleString(),
      sublabel: impressionsSeries.length
        ? `Last snapshot: ${impressionsSeries[impressionsSeries.length - 1].v.toLocaleString()}`
        : undefined,
      delta: toDelta(impressionsSeries),
      data: impressionsSeries,
      accent: "text-blue-600",
    },
    {
      label: "Likes",
      value: totals.likes.toLocaleString(),
      sublabel: likesSeries.length
        ? `Last snapshot: ${likesSeries[likesSeries.length - 1].v.toLocaleString()}`
        : undefined,
      delta: toDelta(likesSeries),
      data: likesSeries,
      accent: "text-emerald-600",
    },
    {
      label: "Comments",
      value: totals.comments.toLocaleString(),
      sublabel: commentsSeries.length
        ? `Last snapshot: ${commentsSeries[commentsSeries.length - 1].v.toLocaleString()}`
        : undefined,
      delta: toDelta(commentsSeries),
      data: commentsSeries,
      accent: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-visible">
        <DateRangeToolbar />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatCard
            key={metric.label}
            title={metric.label}
            value={metric.value}
            sublabel={metric.sublabel}
            delta={metric.delta}
            data={metric.data}
            accentClassName={metric.accent}
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AreaPanel />
        <BarPanel />
      </div>
    </div>
  );
}
