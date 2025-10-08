
import React from 'react';
import { Card as MetricCard } from '@/components/Card';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart2 } from './Icon';

const StatCard: React.FC<{ title: string; value: string; change: string }> = ({ title, value, change }) => (
  <MetricCard title={title} value={value} growth={change} />
)

export const Analytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Analytics</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Followers" value="12,345" change="+5.4%" />
          <StatCard title="Engagement Rate" value="2.57%" change="-0.2%" />
          <StatCard title="Posts Published" value="89" change="+12" />
          <StatCard title="Link Clicks" value="1,204" change="+15%" />
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
