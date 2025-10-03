
import React from 'react';
import { Card } from './Card';
import { Post, SocialPlatform, PostStatus } from '@/lib/types';

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

export const Drafts: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Drafts</h2>
      <Card title="Saved Drafts" description="These posts are not scheduled yet.">
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {mockDrafts.map((post) => (
              <div key={post.id} className="py-4">
                <p className="text-sm font-medium text-indigo-500">{post.platform}</p>
                <p className="mt-1 text-slate-700 dark:text-slate-300">{post.content}</p>
                <div className="mt-2 space-x-2">
                    <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">Edit</button>
                    <button className="text-sm font-semibold text-red-600 hover:text-red-500">Delete</button>
                </div>
              </div>
            ))}
             {mockDrafts.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">You have no saved drafts.</p>
                </div>
             )}
        </div>
      </Card>
    </div>
  );
};
