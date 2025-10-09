
import React from 'react';
import { Card } from './Card';
import { BarChart2 } from './Icon';

const StatCard: React.FC<{ title: string; value: string; change: string }> = ({ title, value, change }) => (
    <Card>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
            <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                {change}
            </p>
        </div>
    </Card>
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
      <Card>
        <div className="flex flex-col items-center justify-center h-96">
            <BarChart2 className="w-16 h-16 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">Full Analytics Coming Soon</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              We're building a comprehensive analytics suite.
            </p>
        </div>
      </Card>
    </div>
  );
};
