import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import GoalBadge from "@/components/dashboard/GoalBadge";
import PostingHeatmap from "@/components/dashboard/PostingHeatmap";
import TopPosts from "@/components/dashboard/TopPosts";
import { env } from "@/lib/env";

const BreakdownSection = dynamic(
  () => import("@/components/analytics/BreakdownSection.client"),
  { ssr: false },
);

export const revalidate = 3600; // Revalidate hourly

export default async function AnalyticsPage() {
  const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

  if (!supabaseConfigured) {
    return (
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <section className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="bg-card/60 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-base font-medium text-slate-600">
                  Analytics unavailable
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">
                  Supabase credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load analytics data.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-4 lg:col-span-1">
            <TopPosts />
            <PostingHeatmap />
          </div>
        </section>
        <section className="space-y-6">
          <BreakdownSection />
        </section>
      </div>
    );
  }

  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("impressions, likes, comments");

  const snapshots = (data || []) as Array<{
    impressions?: number | null;
    likes?: number | null;
    comments?: number | null;
  }>;

  type Totals = { impressions: number; likes: number; comments: number };

  const totals = snapshots.reduce<Totals>(
    (acc, record) => ({
      impressions: acc.impressions + (record.impressions ?? 0),
      likes: acc.likes + (record.likes ?? 0),
      comments: acc.comments + (record.comments ?? 0),
    }),
    { impressions: 0, likes: 0, comments: 0 },
  );

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  const snapshotCount = snapshots.length;
  const totalEngagement = totals.likes + totals.comments;
  const averageImpressions = snapshotCount > 0 ? Math.round(totals.impressions / snapshotCount) : 0;
  const averageEngagement = snapshotCount > 0 ? Math.round(totalEngagement / snapshotCount) : 0;

  const engagementRate =
    totals.impressions > 0 ? (totalEngagement / totals.impressions) * 100 : 0;
  const estimatedPeople = snapshotCount > 0 ? Math.round(totals.impressions * 0.65) : 0;
  const estimatedRevenue = snapshotCount > 0 ? Math.round(totalEngagement * 2.5) : 0;

  const metrics: Array<{
    label: string;
    value: number;
    metricKey: string;
    sublabel: string;
    unit?: string;
    format?: (value: number) => string;
  }> = [
    {
      label: "Engagement rate",
      value: engagementRate,
      metricKey: "engagementRate",
      sublabel: "Average likes and comments per impression",
      unit: "%",
      format: (value) => `${value.toFixed(1)}%`,
    },
    {
      label: "Total impressions",
      value: totals.impressions,
      metricKey: "impressions",
      sublabel: "Lifetime views across snapshots",
      format: (value) => value.toLocaleString(),
    },
    {
      label: "People reached",
      value: estimatedPeople,
      metricKey: "people",
      sublabel: "Estimated unique viewers",
      format: (value) => value.toLocaleString(),
    },
    {
      label: "Revenue influenced",
      value: estimatedRevenue,
      metricKey: "revenue",
      sublabel: "Projected value generated from engagement",
      unit: "$",
      format: (value) => currencyFormatter.format(value),
    },
  ];

  const chartConfig = {
    impressions: {
      label: "Impressions",
      color: "hsl(var(--chart-1))",
    },
    engagement: {
      label: "Engagement",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

  const placeholderChartData = [
    { label: "Jan", impressions: 4200, engagement: 2100 },
    { label: "Feb", impressions: 5100, engagement: 2400 },
    { label: "Mar", impressions: 4600, engagement: 2000 },
    { label: "Apr", impressions: 6100, engagement: 2600 },
    { label: "May", impressions: 5400, engagement: 2300 },
    { label: "Jun", impressions: 6800, engagement: 2900 },
  ];

  const chartData = snapshots.length
    ? snapshots.map((snapshot, index) => ({
        label: `Snapshot ${index + 1}`,
        impressions: snapshot.impressions ?? 0,
        engagement: (snapshot.likes ?? 0) + (snapshot.comments ?? 0),
      }))
    : placeholderChartData;

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-base font-medium text-slate-600">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metric.format ? metric.format(metric.value) : metric.value.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
              <GoalBadge metricKey={metric.metricKey} current={metric.value} unit={metric.unit} />
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card className="bg-card/60 backdrop-blur">
            <CardHeader>
              <CardTitle>Engagement overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                High-level insights gathered from your Supabase analytics snapshots.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Snapshots</p>
                  <p className="text-2xl font-semibold">
                    {snapshotCount > 0 ? snapshotCount : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avg. impressions</p>
                  <p className="text-2xl font-semibold">
                    {averageImpressions > 0 ? averageImpressions.toLocaleString() : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Avg. engagement</p>
                  <p className="text-2xl font-semibold">
                    {averageEngagement > 0 ? averageEngagement.toLocaleString() : "—"}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <ChartContainer
                  config={chartConfig}
                  className="relative h-[260px] w-full overflow-hidden rounded-xl border border-border/40 bg-muted/5"
                >
                  <AreaChart data={chartData} margin={{ left: 12, right: 12, top: 48, bottom: 12 }}>
                    <defs>
                      <linearGradient id="fill-impressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-impressions)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-impressions)" stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="fill-engagement" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-engagement)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-engagement)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="hsl(var(--border) / 0.4)" strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={12}
                      style={{ fontSize: "12px" }}
                      tickFormatter={(value: number) =>
                        value >= 1000 ? `${Math.round(value / 100) / 10}k` : `${value}`
                      }
                    />
                    <ChartTooltip
                      cursor={{ stroke: "hsl(var(--border) / 0.6)", strokeDasharray: "4 4" }}
                      content={<ChartTooltipContent indicator="dot" labelFormatter={(label) => label} />}
                    />
                    <Area
                      type="monotone"
                      dataKey="impressions"
                      stroke="var(--color-impressions)"
                      strokeWidth={2}
                      fill="url(#fill-impressions)"
                      activeDot={{ r: 5 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="engagement"
                      stroke="var(--color-engagement)"
                      strokeWidth={2}
                      fill="url(#fill-engagement)"
                      activeDot={{ r: 5 }}
                    />
                    <ChartLegend verticalAlign="top" height={36} content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
                <p className="text-xs text-muted-foreground">
                  {snapshotCount > 0
                    ? "Activity levels across your saved analytics snapshots."
                    : "Add Supabase analytics snapshots to unlock engagement trend charts."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4 lg:col-span-1">
          <TopPosts />
          <PostingHeatmap />
        </div>
      </section>
      <section className="space-y-6">
        <BreakdownSection />
      </section>
    </div>
  );
}
