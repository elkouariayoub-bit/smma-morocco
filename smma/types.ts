
export enum SocialPlatform {
  LinkedIn = 'LinkedIn',
  Twitter = 'Twitter',
  Instagram = 'Instagram',
  Facebook = 'Facebook'
}

export enum PostStatus {
  Draft = 'Draft',
  Queued = 'Queued',
  Published = 'Published',
  Failed = 'Failed'
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

export type Page = 'composer' | 'queue' | 'drafts' | 'analytics';
