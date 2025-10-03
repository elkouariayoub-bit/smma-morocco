export enum SocialPlatform {
  LinkedIn = 'linkedin',
  Twitter = 'twitter',
  Instagram = 'instagram',
  Facebook = 'facebook',
}

export enum PostStatus {
  Draft = 'draft',
  Queued = 'queued',
  Published = 'published',
  Failed = 'failed'
}

export interface Post {
  id: string;
  platform: SocialPlatform;
  content: string;
  status: PostStatus;
  scheduledAt: Date | null;
  publishedAt?: Date | null;
  analytics?: {
    likes: number;
    comments: number;
    shares: number;
  };
}

export interface ScheduledPost {
  id: string;
  platform: SocialPlatform;
  caption: string | null;
  media_urls: string[];
  scheduled_at: string;
  status: PostStatus;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface AnalyticsSnapshot {
  id: number;
  platform: SocialPlatform;
  snapshot_date: string;
  impressions: number;
  likes: number;
  comments: number;
}

export type Page = 'composer' | 'queue' | 'drafts' | 'analytics';
