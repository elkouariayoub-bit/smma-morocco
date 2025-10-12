"use client";

import React from "react";

import GoalBadge from "@/components/dashboard/GoalBadge";
import { Card as MetricCard } from "@/components/Card";
import { Card, CardContent } from "@/components/ui/card";

import { BarChart2 } from "./Icon";

type GoalMeta = {
  key: string;
  current: number;
  unit?: string;
};

const StatCard: React.FC<{ title: string; value: string; change: string; goal?: GoalMeta }> = ({
  title,
  value,
  change,
  goal,
}) => (
  <MetricCard title={title} value={value} growth={change}>
    {goal ? <GoalBadge metricKey={goal.key} current={goal.current} unit={goal.unit} /> : null}
  </MetricCard>
);

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Analytics</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Engagement rate"
          value="5.4%"
          change="+0.8%"
          goal={{ key: "engagementRate", current: 5.4, unit: "%" }}
        />
        <StatCard
          title="Impressions"
          value="121.5K"
          change="+4.3%"
          goal={{ key: "impressions", current: 121_500 }}
        />
        <StatCard
          title="People reached"
          value="53.2K"
          change="+2.1%"
          goal={{ key: "people", current: 53_200 }}
        />
        <StatCard
          title="Total revenue"
          value="$15,231.89"
          change="+6.7%"
          goal={{ key: "revenue", current: 15_231.89 }}
        />
      </div>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardContent className="flex h-96 flex-col items-center justify-center gap-4 text-center">
          <BarChart2 className="h-16 w-16 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-800">Full Analytics Coming Soon</h3>
          <p className="text-sm text-slate-500">
            We're building a comprehensive analytics suite.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
