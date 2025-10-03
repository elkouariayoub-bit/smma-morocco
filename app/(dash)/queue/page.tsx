import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { getMissingEnvVars } from "@/lib/env";
import { MissingEnvNotice } from "@/components/MissingEnvNotice";

// Revalidate data periodically to keep the queue fresh
export const revalidate = 60;

export default async function QueuePage() {
  const missingSupabase = getMissingEnvVars(['supabaseUrl', 'supabaseAnonKey']);

  if (missingSupabase.length) {
    return (
      <MissingEnvNotice
        missing={missingSupabase}
        title="Supabase environment variables are missing"
        description="The queue cannot load scheduled posts until Supabase credentials are configured."
      />
    );
  }

  const supabase = createServerComponentClient({ cookies });
  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select('*')
    .order('scheduled_at', { ascending: true });

  return (
    <Card>
        <CardHeader>
            <CardTitle>Queue</CardTitle>
            <CardDescription>View your upcoming scheduled posts.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
            {error && <p className="text-red-500">Error loading queue: {error.message}</p>}
            {!error && (!posts || posts.length === 0) && (
                <p className="text-gray-600 text-center py-8">Your queue is empty.</p>
            )}
            {posts?.map((item: { id: string; platform: string; caption: string; scheduled_at: string }) => (
                <div key={item.id} className="border p-4 rounded-2xl bg-white">
                    <div className="flex items-center justify-between">
                        <div>
                        <div className="text-sm capitalize font-medium">{item.platform}</div>
                        <div className="text-gray-700 mt-1 text-sm">{item.caption}</div>
                        </div>
                        <div className="text-sm text-gray-600 text-right shrink-0 ml-4">
                            {new Date(item.scheduled_at).toLocaleString()}
                        </div>
                    </div>
                </div>
            ))}
            </div>
      </CardContent>
    </Card>
  );
}
