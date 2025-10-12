import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SocialPlatform, PostStatus, Post } from "@/lib/types";
import { Pencil, Trash2, FileText, CalendarClock } from 'lucide-react';

const mockDrafts: Post[] = [
  {
    id: 'd1',
    platform: SocialPlatform.Facebook,
    content: 'Thinking about our next big marketing campaign. What are some of the most creative campaigns you\'ve seen recently? #marketing #inspiration',
    status: PostStatus.Draft,
    scheduledAt: null,
  },
  {
    id: 'd2',
    platform: SocialPlatform.Twitter,
    content: 'A thread on the future of remote work...',
    status: PostStatus.Draft,
    scheduledAt: null,
  },
];

export default function DraftsPage() {
  return (
    <DashboardShell
      title="Drafts"
      description="Organise ideas, collaborate with stakeholders, and publish when everything is ready."
      breadcrumbs={[{ label: 'Dashboard', href: '/composer' }, { label: 'Drafts' }]}
      actions={<Button variant="primary" size="sm">New draft</Button>}
    >
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Draft library</CardTitle>
            <CardDescription>Send for review, convert to scheduled posts, or archive ideas that are no longer needed.</CardDescription>
          </div>
          <Button variant="outline" size="sm" title="Download as CSV soon">Export</Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-200">
            {mockDrafts.map((post) => (
              <div key={post.id} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                    <FileText className="h-3.5 w-3.5" /> {post.platform}
                  </span>
                  <p className="text-sm text-slate-700">{post.content}</p>
                  <p className="text-xs text-slate-400">Last edited 2 days ago · Not scheduled</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <Pencil className="h-4 w-4" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <CalendarClock className="h-4 w-4" /> Schedule
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            ))}
            {mockDrafts.length === 0 && (
              <EmptyState
                icon={FileText}
                title="No saved drafts"
                description="Capture ideas from brainstorms, drop inspiration links, and revisit them before scheduling."
              />
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
