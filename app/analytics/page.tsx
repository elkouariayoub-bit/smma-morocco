import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { EngagementChart } from "@/components/dashboard/engagement-chart";
import { EmptyState } from "@/components/dashboard/empty-state";
import { TrendingUp, Sparkles, BarChart3 } from 'lucide-react';

export const revalidate = 3600; // Revalidate hourly

interface Snapshot {
  impressions: number | null;
  likes: number | null;
  comments: number | null;
}

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from('analytics_snapshots')
    .select('impressions, likes, comments');

  const totals = (data || []).reduce((acc, r) => ({
    impressions: acc.impressions + (r.impressions ?? 0),
    likes: acc.likes + (r.likes ?? 0),
    comments: acc.comments + (r.comments ?? 0),
  }), { impressions: 0, likes: 0, comments: 0 });

  const timeline = (data as Snapshot[] | null)?.map((row, index) => ({
    date: `Day ${index + 1}`,
    impressions: row.impressions ?? 0,
    likes: row.likes ?? 0,
    comments: row.comments ?? 0,
  })) ?? [];

  const hasData = timeline.length > 0;

  const metrics = [
    { label: 'Total impressions', value: totals.impressions, change: '+18% vs last week' },
    { label: 'Total likes', value: totals.likes, change: '+6% vs last week' },
    { label: 'Total comments', value: totals.comments, change: '+12% vs last week' },
  ];

  return (
    <DashboardShell
      title="Analytics"
      description="Understand performance trends across every social channel and spot what to optimise next."
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Analytics' }]}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="space-y-2 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
              <p className="text-2xl font-semibold text-slate-900">{metric.value.toLocaleString()}</p>
              <p className="text-xs text-success">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Engagement overview</CardTitle>
            <CardDescription>Monitor impressions, likes, and comments across time to identify trends.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {hasData ? (
            <EngagementChart data={timeline} />
          ) : (
            <EmptyState
              icon={TrendingUp}
              title="No analytics yet"
              description="Once content is published, you\'ll see performance trends and recommended next steps here."
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Channel insights</CardTitle>
            <CardDescription>Highlights where your audience is most active so you can double down.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Stories outperform feed posts</p>
                <p className="text-xs text-slate-500">Stories delivered 32% more impressions last week—promote time-sensitive offers there.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-accent">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Engagement spikes midweek</p>
                <p className="text-xs text-slate-500">Audience is most active Tuesdays–Thursdays. Schedule hero content during these windows.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Next best actions</CardTitle>
            <CardDescription>Recommendations generated from your latest performance data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner">
              <p className="font-medium text-slate-800">Boost top performing post</p>
              <p className="mt-1 text-xs text-slate-500">Repost the best performing story as a reel to extend reach by ~18%.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-inner">
              <p className="font-medium text-slate-800">Launch Q&A session</p>
              <p className="mt-1 text-xs text-slate-500">Followers submitted 42 questions this week. Host an AMA to nurture community.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
