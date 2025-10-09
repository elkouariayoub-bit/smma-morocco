import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { env } from "@/lib/env";

export const revalidate = 3600; // Revalidate hourly

export default async function AnalyticsPage() {
  const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

  if (!supabaseConfigured) {
    return (
      <div className="p-4 md:p-6">
        <Card>
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
    );
  }

  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from('analytics_snapshots')
    .select('impressions, likes, comments');

  const totals = (data || []).reduce(
    (acc, record) => ({
      impressions: acc.impressions + (record.impressions ?? 0),
      likes: acc.likes + (record.likes ?? 0),
      comments: acc.comments + (record.comments ?? 0),
    }),
    { impressions: 0, likes: 0, comments: 0 },
  );

  const metrics = [
    { label: 'Impressions', value: totals.impressions },
    { label: 'Likes', value: totals.likes },
    { label: 'Comments', value: totals.comments },
  ];

  return (
    <div className="grid gap-4 p-4 md:grid-cols-3 md:p-6">
      {metrics.map((metric) => (
        <Card key={metric.label}>
          <CardHeader>
            <CardTitle className="text-base font-medium text-slate-600">
              {metric.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metric.value.toLocaleString()}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
