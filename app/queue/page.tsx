import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { DataTable, type DataTableProps } from "@/components/dashboard/data-table";
import { EmptyState } from "@/components/dashboard/empty-state";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { CalendarClock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ScheduledPost {
  id: string;
  platform: string;
  caption: string;
  scheduled_at: string;
  status: 'upcoming' | 'overdue';
}

const columns: DataTableProps<ScheduledPost>['columns'] = [
  {
    key: 'platform',
    label: 'Platform',
    sortable: true,
    render: (value) => (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
        {value as string}
      </span>
    ),
  },
  {
    key: 'caption',
    label: 'Caption',
    render: (value) => <p className="max-w-xl truncate text-sm text-slate-600">{value as string}</p>,
  },
  {
    key: 'scheduled_at',
    label: 'Scheduled for',
    sortable: true,
    render: (value) => <span className="text-sm font-medium text-slate-700">{new Date(value as string).toLocaleString()}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value) => (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
          value === 'upcoming'
            ? 'bg-success-soft text-success'
            : 'bg-warning-soft text-warning'
        }`}
      >
        {value === 'upcoming' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
        {value === 'upcoming' ? 'On track' : 'Needs reschedule'}
      </span>
    ),
  },
];

// Revalidate data periodically to keep the queue fresh
export const revalidate = 60;

export default async function QueuePage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('scheduled_at', { ascending: true });

  const mappedPosts: ScheduledPost[] = (posts ?? []).map((item) => ({
    id: item.id,
    platform: item.platform,
    caption: item.caption,
    scheduled_at: item.scheduled_at,
    status: new Date(item.scheduled_at) >= new Date() ? 'upcoming' : 'overdue',
  }));

  const upcomingCount = mappedPosts.filter((post) => post.status === 'upcoming').length;
  const overdueCount = mappedPosts.filter((post) => post.status === 'overdue').length;
  const nextPost = mappedPosts[0];

  return (
    <DashboardShell
      title="Queue"
      description="Review upcoming content, adjust priorities, and keep every channel on cadence."
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Queue' }]}
      actions={<Button variant="primary" size="sm">Schedule new post</Button>}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="space-y-1 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Next publish</p>
            <p className="text-lg font-semibold text-slate-900">{nextPost ? new Date(nextPost.scheduled_at).toLocaleString() : 'Not scheduled'}</p>
            <p className="text-xs text-slate-500">Stay consistent by scheduling at least 3 posts per week.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Ready in queue</p>
            <p className="text-lg font-semibold text-slate-900">{mappedPosts.length}</p>
            <p className="text-xs text-slate-500">Optimise cadence by balancing across platforms.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Upcoming</p>
            <p className="text-lg font-semibold text-slate-900">{upcomingCount}</p>
            <p className="text-xs text-slate-500">Track approvals to keep everything on schedule.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1 px-6 py-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Needs attention</p>
            <p className={`text-lg font-semibold ${overdueCount > 0 ? 'text-warning' : 'text-slate-900'}`}>{overdueCount}</p>
            <p className="text-xs text-slate-500">Reschedule overdue posts to maintain momentum.</p>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive-soft">
          <CardHeader>
            <CardTitle className="text-destructive">Unable to load queue</CardTitle>
            <CardDescription className="text-destructive/80">{error.message}</CardDescription>
          </CardHeader>
        </Card>
      )}

      {!error && mappedPosts.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title="Your queue is empty"
          description="Plan ahead by scheduling posts throughout the week. Consistency boosts algorithm performance."
        />
      )}

      {!error && mappedPosts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Scheduled posts</CardTitle>
              <CardDescription>Sort, filter, and adjust your queue. Click a row to edit in the composer.</CardDescription>
            </div>
            <Button variant="outline" size="sm">Export queue</Button>
          </CardHeader>
          <CardContent>
            <DataTable data={mappedPosts} columns={columns} />
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  );
}
