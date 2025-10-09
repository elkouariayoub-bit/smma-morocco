
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { Post, PostStatus } from '../types';

export const Queue: React.FC = () => {
  const [queue, setQueue] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/posts');
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          const fetchedPosts: Post[] = json.data
            .filter((item: any) => item.scheduled_at) // Filter out drafts
            .map((item: any) => ({
              ...item,
              scheduledAt: new Date(item.scheduled_at),
              status: PostStatus.Queued,
            }));
          setQueue(fetchedPosts);
        } else {
          console.error("Failed to fetch queue:", json.error);
          setQueue([]);
        }
      } catch (error) {
        console.error("Error fetching queue:", error);
        setQueue([]);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);


  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Queue</h2>
      <Card title="Scheduled Posts" description="These posts are waiting to be published.">
        <div className="flow-root p-6">
            {loading && (
                <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">Loading your queue...</p>
                </div>
            )}
            {!loading && queue.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-slate-500 dark:text-slate-400">Your queue is empty.</p>
                </div>
            )}
            {!loading && queue.length > 0 && (
                 <ul role="list" className="-mb-8">
                    {queue.map((post, postIdx) => (
                    <li key={post.id}>
                        <div className="relative pb-8">
                        {postIdx !== queue.length - 1 ? (
                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex items-start space-x-3">
                            <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center ring-8 ring-white dark:ring-slate-800">
                                <p className="text-white font-bold text-sm capitalize">{post.platform.charAt(0)}</p>
                            </span>
                            </div>
                            <div className="min-w-0 flex-1">
                            <div>
                                <div className="text-sm">
                                <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{post.platform} Post</p>
                                </div>
                                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                                Scheduled for {post.scheduledAt?.toLocaleString()}
                                </p>
                            </div>
                            <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/20 p-3 rounded-md">
                                <p className="whitespace-pre-wrap">{post.content.substring(0, 150)}{post.content.length > 150 ? '...' : ''}</p>
                            </div>
                            </div>
                        </div>
                        </div>
                    </li>
                    ))}
                </ul>
            )}
        </div>
      </Card>
    </div>
  );
};
