import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SocialPlatform, PostStatus, Post } from "@/lib/types";

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
    <div className="p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Drafts</CardTitle>
          <CardDescription>These posts are not scheduled yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-200">
            {mockDrafts.map((post) => (
              <div key={post.id} className="py-4">
                <p className="text-sm font-medium text-slate-500 capitalize">{post.platform}</p>
                <p className="mt-1 text-slate-800">{post.content}</p>
                <div className="mt-3 space-x-2">
                  <Button variant="secondary" size="sm">
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
            {mockDrafts.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-slate-500">You have no saved drafts.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
