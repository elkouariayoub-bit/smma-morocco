"use client";

import useSWR from "swr";
import { useMemo, type ReactNode } from "react";
import { useDateRange } from "@/app/providers/date-range";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import type {
  BreakdownResponse,
  Metric,
  Breakdown,
  Platform,
} from "@/lib/breakdown";

const PIE_SLICE_COLORS = [
  "#0EA5E9",
  "#6366F1",
  "#F97316",
  "#10B981",
  "#EC4899",
  "#FACC15",
  "#3B82F6",
  "#A855F7",
];

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as { data?: BreakdownResponse };
};

type BreakdownPanelProps = {
  metric: Metric;
  by: Breakdown;
  platform: Platform | "all";
};

export default function BreakdownPanel({ metric, by, platform }: BreakdownPanelProps) {
  const { range } = useDateRange();

  const params = useMemo(() => {
    if (!range.start || !range.end) {
      return null;
    }
    return new URLSearchParams({
      start: range.start,
      end: range.end,
      metric,
      by,
      platform,
    });
  }, [range.start, range.end, metric, by, platform]);

  const queryKey = useMemo(() => {
    if (!params) {
      return null;
    }
    return `/api/posts/breakdown?${params.toString()}`;
  }, [params]);

  const { data, isLoading, error } = useSWR(queryKey, fetcher, {
    revalidateOnFocus: false,
  });

  const rows = data?.data?.rows ?? [];
  const total = data?.data?.total ?? 0;
  const hasError = Boolean(error);

  const chartContent = useMemo(() => {
    if (by === "gender") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip />
            <Pie data={rows} dataKey="value" nameKey="label" outerRadius={110}>
              {rows.map((row, index) => (
                <Cell key={row.key} fill={PIE_SLICE_COLORS[index % PIE_SLICE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          <CartesianGrid vertical={false} strokeOpacity={0.1} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }, [by, rows]);

  const exportQuery = params?.toString();

  return (
    <Card className="bg-card/60 backdrop-blur">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>
          Audience Breakdown — {titleForMetric(metric)} by {titleForBreakdown(by)}
        </CardTitle>
        <div className="flex flex-wrap items-center gap-2">
          <ExportLink
            label="Export CSV"
            href={exportQuery ? `/api/export/breakdown/csv?${exportQuery}` : undefined}
            disabled={!exportQuery}
          />
          <ExportLink
            label="Excel"
            href={exportQuery ? `/api/export/breakdown/excel?${exportQuery}` : undefined}
            disabled={!exportQuery}
          />
          <ExportLink
            label="PDF"
            href={exportQuery ? `/api/export/breakdown/pdf?${exportQuery}` : undefined}
            disabled={!exportQuery}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading && <StatusMessage>Loading breakdown…</StatusMessage>}
        {hasError && <StatusMessage tone="error">Failed to load breakdown.</StatusMessage>}
        {!isLoading && !hasError && rows.length === 0 && (
          <StatusMessage>No breakdown data available for this range.</StatusMessage>
        )}
        {!isLoading && !hasError && rows.length > 0 && (
          <>
            <div className="h-60">{chartContent}</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Segment</th>
                    <th className="p-2 text-right">
                      {metric === "engagement_rate" ? "Avg %" : "Value"}
                    </th>
                    {metric !== "engagement_rate" && (
                      <th className="p-2 text-right">% Share</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.key} className="border-t">
                      <td className="p-2">{row.label}</td>
                      <td className="p-2 text-right">{formatValue(metric, row.value)}</td>
                      {metric !== "engagement_rate" && (
                        <td className="p-2 text-right">{formatPercent(row.pct)}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
                {metric !== "engagement_rate" && (
                  <tfoot>
                    <tr className="border-t">
                      <td className="p-2 font-medium">Total</td>
                      <td className="p-2 text-right font-medium">{total.toLocaleString()}</td>
                      <td className="p-2 text-right font-medium">100%</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

type StatusTone = "default" | "error";

function StatusMessage({ children, tone = "default" }: { children: ReactNode; tone?: StatusTone }) {
  const toneClasses = tone === "error" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className={`rounded-md border border-dashed p-4 text-sm ${toneClasses}`}>
      {children}
    </div>
  );
}

function ExportLink({
  label,
  href,
  disabled,
}: {
  label: string;
  href?: string;
  disabled?: boolean;
}) {
  if (disabled || !href) {
    return (
      <Button variant="outline" size="sm" disabled>
        {label}
      </Button>
    );
  }

  return (
    <Button asChild variant="outline" size="sm">
      <a href={href}>{label}</a>
    </Button>
  );
}

function titleForMetric(metric: Metric) {
  switch (metric) {
    case "engagement_rate":
      return "Engagement rate";
    case "people":
      return "People reached";
    default:
      return "Impressions";
  }
}

function titleForBreakdown(by: Breakdown) {
  switch (by) {
    case "age":
      return "Age";
    case "geo":
      return "Geography";
    default:
      return "Gender";
  }
}

function formatValue(metric: Metric, value: number) {
  return metric === "engagement_rate" ? `${value.toFixed(2)}%` : value.toLocaleString();
}

function formatPercent(value?: number) {
  if (!value) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
}
