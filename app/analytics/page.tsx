import DateRangeToolbar from "@/components/DateRangeToolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const revalidate = 3600; // Revalidate hourly

export default async function AnalyticsPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase
    .from("analytics_snapshots")
    .select("impressions, likes, comments");

  const totals = (data ?? []).reduce(
    (acc, row) => ({
      impressions: acc.impressions + (row.impressions ?? 0),
      likes: acc.likes + (row.likes ?? 0),
      comments: acc.comments + (row.comments ?? 0),
    }),
    { impressions: 0, likes: 0, comments: 0 }
  );

  const metrics = [
    { label: "Impressions", value: totals.impressions },
    { label: "Likes", value: totals.likes },
    { label: "Comments", value: totals.comments },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-visible">
        <DateRangeToolbar />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader>
              <CardTitle className="text-base font-medium text-gray-600">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metric.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
