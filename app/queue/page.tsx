import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { env } from "@/lib/env";
import { createClient } from "@/lib/supabase";

// Revalidate data periodically to keep the queue fresh
export const revalidate = 60;

export default async function QueuePage() {
  const supabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

  if (!supabaseConfigured) {
    return (
      <div className="p-4 md:p-6">
        <Card>
          <CardHeader>
            <CardTitle>Queue</CardTitle>
            <CardDescription>View your upcoming scheduled posts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Supabase credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to load the queue.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const supabase = createClient();
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('scheduled_at', { ascending: true });

  return (
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Queue</CardTitle>
          <CardDescription>View your upcoming scheduled posts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && <p className="text-red-500">Error loading queue: {error.message}</p>}
            {!error && (!posts || posts.length === 0) && (
              <p className="py-8 text-center text-slate-600">Your queue is empty.</p>
            )}
            {posts?.map((item) => (
              <div key={item.id} className="rounded-2xl border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium capitalize text-slate-600">{item.platform}</div>
                    <div className="mt-1 text-sm text-slate-800">{item.caption}</div>
                  </div>
                  <div className="ml-4 shrink-0 text-right text-sm text-slate-600">
                    {new Date(item.scheduled_at).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
