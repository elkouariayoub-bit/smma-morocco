'use client';

import { useMemo, useState } from 'react';
import { Activity, CalendarClock, MessageSquareText, Rocket } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip } from '@/components/ui/tooltip';

const metricCards = [
  {
    title: 'Scheduled posts',
    value: '28',
    change: '+12% vs last week',
    icon: CalendarClock,
  },
  {
    title: 'AI captions generated',
    value: '134',
    change: '+24% vs last week',
    icon: MessageSquareText,
  },
  {
    title: 'Engagement rate',
    value: '4.8%',
    change: '+0.9% vs target',
    icon: Activity,
  },
  {
    title: 'Campaign momentum',
    value: 'On track',
    change: '6 milestones completed',
    icon: Rocket,
  },
];

const engagementTrend = [
  { month: 'Jan', reach: 1240, conversions: 108 },
  { month: 'Feb', reach: 1410, conversions: 132 },
  { month: 'Mar', reach: 1632, conversions: 144 },
  { month: 'Apr', reach: 1721, conversions: 157 },
  { month: 'May', reach: 1890, conversions: 166 },
  { month: 'Jun', reach: 2145, conversions: 190 },
  { month: 'Jul', reach: 2381, conversions: 214 },
];

const chartGradients = [
  { id: 'reachGradient', color: 'var(--color-primary)' },
  { id: 'conversionGradient', color: 'var(--color-secondary)' },
];

function TrendChart({ data }: { data: typeof engagementTrend }) {
  const chartPadding = 8;
  const chartHeight = 100 - chartPadding * 2;
  const chartWidth = 100;

  const maxValue = Math.max(
    ...data.map((point) => Math.max(point.reach, point.conversions)),
    1
  );

  const getCoords = (key: 'reach' | 'conversions') =>
    data.map((point, index) => {
      const x = data.length > 1 ? (index / (data.length - 1)) * chartWidth : chartWidth / 2;
      const y = chartPadding + chartHeight - (point[key] / maxValue) * chartHeight;
      return { x, y, value: point[key], label: point.month };
    });

  const reachCoords = getCoords('reach');
  const conversionsCoords = getCoords('conversions');

  const baseY = chartPadding + chartHeight;

  const buildAreaPath = (coords: typeof reachCoords) => {
    if (coords.length === 0) {
      return '';
    }

    const startX = coords[0]?.x ?? 0;
    const endX = coords[coords.length - 1]?.x ?? chartWidth;

    const points = coords
      .map((coord, index) => `${index === 0 ? 'L' : 'L'} ${coord.x} ${coord.y}`)
      .join(' ');

    return `M ${startX} ${baseY} ${points} L ${endX} ${baseY} Z`;
  };

  const buildLinePath = (coords: typeof reachCoords) =>
    coords.map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x} ${coord.y}`).join(' ');

  const horizontalGuides = Array.from({ length: 4 }).map((_, index) => {
    const y = chartPadding + (chartHeight / 4) * (index + 1);
    const value = Math.round((maxValue * (4 - (index + 1))) / 4);
    return { id: index, y, value };
  });

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1">
        <svg viewBox={`0 0 ${chartWidth} 100`} preserveAspectRatio="none" className="h-full w-full">
          <defs>
            {chartGradients.map((gradient) => (
              <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradient.color} stopOpacity="0.45" />
                <stop offset="95%" stopColor={gradient.color} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          <g stroke="rgba(148,163,184,0.25)" strokeWidth="0.4">
            {horizontalGuides.map((guide) => (
              <line key={guide.id} x1="0" y1={guide.y} x2={chartWidth} y2={guide.y} strokeDasharray="4 6" />
            ))}
          </g>
          <path d={buildAreaPath(reachCoords)} fill="url(#reachGradient)" />
          <path d={buildAreaPath(conversionsCoords)} fill="url(#conversionGradient)" />
          <path d={buildLinePath(reachCoords)} fill="none" stroke="var(--color-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d={buildLinePath(conversionsCoords)}
            fill="none"
            stroke="var(--color-secondary)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {[reachCoords, conversionsCoords].map((coords, seriesIndex) => (
            <g key={seriesIndex} fill={seriesIndex === 0 ? 'var(--color-primary)' : 'var(--color-secondary)'}>
              {coords.map((coord) => (
                <circle key={`${seriesIndex}-${coord.label}`} cx={coord.x} cy={coord.y} r="1.6">
                  <title>
                    {coord.label}: {coord.value.toLocaleString()} {seriesIndex === 0 ? 'reach' : 'conversions'}
                  </title>
                </circle>
              ))}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-6 grid grid-cols-7 gap-2 text-xs font-medium text-muted">
        {data.map((point) => (
          <span key={point.month} className="text-center tracking-wide">
            {point.month}
          </span>
        ))}
      </div>
    </div>
  );
}

const pipeline = [
  { id: '1', campaign: 'Summer Launch', platform: 'Instagram', status: 'Queued', scheduledAt: '2024-07-20', reach: '28.4K' },
  { id: '2', campaign: 'Product Stories', platform: 'TikTok', status: 'Draft', scheduledAt: '2024-07-22', reach: '—' },
  { id: '3', campaign: 'Leadership AMA', platform: 'LinkedIn', status: 'Scheduled', scheduledAt: '2024-07-19', reach: '12.6K' },
  { id: '4', campaign: 'Growth Tips', platform: 'X (Twitter)', status: 'Published', scheduledAt: '2024-07-15', reach: '9.1K' },
  { id: '5', campaign: 'Weekly Newsletter', platform: 'Email', status: 'Scheduled', scheduledAt: '2024-07-21', reach: '18.9K' },
  { id: '6', campaign: 'Customer Spotlight', platform: 'Instagram', status: 'Draft', scheduledAt: '2024-07-24', reach: '—' },
  { id: '7', campaign: 'Podcast Drop', platform: 'YouTube', status: 'Queued', scheduledAt: '2024-07-23', reach: '7.3K' },
];

const statusColor: Record<string, string> = {
  Draft: 'bg-warning/15 text-warning',
  Queued: 'bg-secondary/15 text-secondary',
  Scheduled: 'bg-primary/15 text-primary',
  Published: 'bg-success/15 text-success',
};

const statusOrder = ['Draft', 'Queued', 'Scheduled', 'Published'];

function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[status] ?? 'bg-muted/20 text-foreground'}`}>{status}</span>;
}

export default function DashboardPage() {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Queued' | 'Scheduled' | 'Published'>('All');
  const [sortKey, setSortKey] = useState<'campaign' | 'platform' | 'scheduledAt' | 'status'>('scheduledAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 4;

  const filteredRows = useMemo(() => {
    let rows = [...pipeline];
    if (statusFilter !== 'All') {
      rows = rows.filter((row) => row.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      rows = rows.filter((row) =>
        row.campaign.toLowerCase().includes(query) ||
        row.platform.toLowerCase().includes(query)
      );
    }
    rows.sort((a, b) => {
      if (sortKey === 'scheduledAt') {
        const aDate = new Date(a.scheduledAt).getTime();
        const bDate = new Date(b.scheduledAt).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }
      if (sortKey === 'status') {
        const aIndex = statusOrder.indexOf(a.status);
        const bIndex = statusOrder.indexOf(b.status);
        return sortDirection === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      }
      const valueA = a[sortKey].toLowerCase();
      const valueB = b[sortKey].toLowerCase();
      return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
    return rows;
  }, [statusFilter, sortDirection, sortKey, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const paginatedRows = filteredRows.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  const handleSort = (key: typeof sortKey) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.title} className="group overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardDescription className="uppercase tracking-[0.18em] text-xs">{card.title}</CardDescription>
                <CardTitle className="mt-3 text-3xl font-semibold">{card.value}</CardTitle>
                <p className="mt-2 text-sm text-muted">{card.change}</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary/15">
                <card.icon className="h-5 w-5" />
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Engagement velocity</CardTitle>
              <CardDescription>Rolling 6-month performance across channels</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="rounded-lg border border-border/60 bg-surface/80 text-sm font-medium text-muted hover:text-foreground">
              Last 6 months
            </Button>
          </CardHeader>
          <CardContent className="h-[320px]">
            <TrendChart data={engagementTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Channel focus</CardTitle>
            <CardDescription>Where your team invests this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: 'Instagram stories', progress: 74, color: 'bg-primary' },
              { label: 'LinkedIn thought leadership', progress: 58, color: 'bg-secondary' },
              { label: 'YouTube repurposing', progress: 42, color: 'bg-success' },
            ].map((channel) => (
              <div key={channel.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-foreground">{channel.label}</p>
                  <span className="text-muted">{channel.progress}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-surface">
                  <div className={`${channel.color} h-full rounded-full`} style={{ width: `${channel.progress}%` }} />
                </div>
              </div>
            ))}
            <Button className="w-full justify-center" variant="secondary">
              View channel planner
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Publishing pipeline</CardTitle>
              <CardDescription>Sort, filter, and action upcoming content</CardDescription>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Input
                placeholder="Search campaigns or platforms"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(0);
                }}
                className="w-full sm:w-[220px]"
              />
              <select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value as typeof statusFilter);
                  setPage(0);
                }}
                className="h-10 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none"
              >
                {['All', 'Draft', 'Queued', 'Scheduled', 'Published'].map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border/60">
              <table className="min-w-full divide-y divide-border/80 text-sm">
                <thead className="bg-surface">
                  <tr>
                    {[
                      { key: 'campaign', label: 'Campaign' },
                      { key: 'platform', label: 'Channel' },
                      { key: 'status', label: 'Status' },
                      { key: 'scheduledAt', label: 'Publish date' },
                      { key: 'reach', label: 'Projected reach' },
                    ].map((column) => (
                      <th
                        key={column.key}
                        onClick={() => column.key !== 'reach' && handleSort(column.key as typeof sortKey)}
                        className={`px-5 py-3 text-left font-semibold uppercase tracking-[0.14em] text-xs text-muted ${
                          column.key !== 'reach' ? 'cursor-pointer hover:text-foreground' : ''
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          {column.label}
                          {column.key === sortKey && (
                            <span className="text-[10px] text-muted/80">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                          )}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/80">
                  {paginatedRows.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted">
                        <div className="space-y-2">
                          <p className="font-semibold text-foreground">No campaigns match these filters yet.</p>
                          <p className="text-sm text-muted">Adjust filters or create a new campaign to populate this view.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {paginatedRows.map((row) => (
                    <tr key={row.id} className="bg-white/40 transition hover:bg-white/70">
                      <td className="px-5 py-4 font-medium text-foreground">{row.campaign}</td>
                      <td className="px-5 py-4 text-muted">{row.platform}</td>
                      <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                      <td className="px-5 py-4 text-muted">{new Date(row.scheduledAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4 text-foreground">{row.reach}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
              <p>
                Showing <span className="font-semibold text-foreground">{paginatedRows.length}</span> of{' '}
                <span className="font-semibold text-foreground">{filteredRows.length}</span> campaigns
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="rounded-lg border border-border px-3 py-1 text-sm text-foreground">
                  {currentPage + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick schedule</CardTitle>
            <CardDescription>Launch something in seconds with AI assistance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Campaign title</label>
              <Input placeholder="Summer field campaign" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Primary message</label>
              <Textarea rows={4} placeholder="Outline the key message or CTA for this launch" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Channel</label>
                <select className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground focus:border-primary focus:outline-none">
                  {['Instagram', 'LinkedIn', 'TikTok', 'YouTube'].map((channel) => (
                    <option key={channel}>{channel}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Schedule</label>
                <Input type="datetime-local" />
              </div>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-border/70 bg-surface/70 p-4 text-sm">
              <div className="flex items-center justify-between font-medium text-foreground">
                AI insights
                <Tooltip label="Our AI assistant analyzes your draft and suggests improvements based on historic performance.">
                  <span className="text-xs text-muted underline decoration-dotted underline-offset-4">How it works</span>
                </Tooltip>
              </div>
              <p className="text-muted">
                Keep your hook concise, highlight an outcome, and close with a human invitation. Posts scheduled around 10:30 AM local time outperform late afternoon slots by 12%.
              </p>
            </div>
            <Button className="w-full" size="lg">
              Generate & schedule
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Team activity</CardTitle>
            <CardDescription>Latest approvals and edits from collaborators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { user: 'Sarah Chen', action: 'approved', context: 'Leadership AMA', time: '2 hours ago' },
              { user: 'Daniel Reyes', action: 'left feedback', context: 'Growth Tips', time: '3 hours ago' },
              { user: 'Emily Cooper', action: 'scheduled', context: 'Customer Spotlight', time: 'yesterday' },
            ].map((activity) => (
              <div key={activity.context} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/70 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {activity.user
                    .split(' ')
                    .map((name) => name[0])
                    .join('')}
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-semibold text-foreground">
                    {activity.user}{' '}
                    <span className="font-normal text-muted">{activity.action}</span>
                  </p>
                  <p className="text-muted">{activity.context}</p>
                </div>
                <span className="text-xs text-muted">{activity.time}</span>
              </div>
            ))}
            <Button variant="ghost" className="w-full justify-center text-sm text-primary hover:text-primary/80">
              See full activity log
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insights & opportunities</CardTitle>
            <CardDescription>Quick wins curated for your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <p className="font-semibold text-primary">Optimize TikTok hook</p>
              <p className="mt-1 text-muted">High-performing videos start with audience-centric questions. Try “What would you do if…?” this week.</p>
            </div>
            <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-4">
              <p className="font-semibold text-secondary">Repurpose webinar snippets</p>
              <p className="mt-1 text-muted">Cut three 30-second highlights from your June webinar and schedule them across LinkedIn and Instagram Reels.</p>
            </div>
            <div className="rounded-2xl border border-success/20 bg-success/5 p-4">
              <p className="font-semibold text-success">Celebrate customer wins</p>
              <p className="mt-1 text-muted">Feature last month’s top customer story to drive community engagement and referrals.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
