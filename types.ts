
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

export type Page = 'composer' | 'queue' | 'drafts' | 'analytics' | 'clients';

export interface UserIntegration {
  id: string;
  user_id: string;
  platform: 'meta' | 'x' | 'tiktok';
  api_key?: string;
  api_secret?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  is_connected: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetric {
  key: string;
  value: number;
  change: number;
}

export interface DashboardSeriesPoint {
  metric: string;
  date: string;
  value: number;
}

export interface DashboardMetricsResponse {
  clients: number;
  campaigns: number;
  metrics: DashboardMetric[];
  series: DashboardSeriesPoint[];
  generatedAt: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  contact: string;
  status: 'active' | 'inactive';
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type DashboardFilterPreset = 'last_7_days' | 'last_30_days' | 'last_90_days';
