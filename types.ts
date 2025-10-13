
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

export type CampaignStatus = 'planned' | 'active' | 'paused' | 'completed' | 'archived';
export type CampaignMilestoneStatus = 'pending' | 'in_progress' | 'completed';

export interface CampaignMilestone {
  id: string;
  label: string;
  date: string;
  status: CampaignMilestoneStatus;
}

export interface Campaign {
  id: string;
  user_id: string;
  client_id: string | null;
  client_name?: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  startDate: string;
  endDate?: string | null;
  position: number;
  milestones: CampaignMilestone[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export type ReportExportFormat = 'csv' | 'pdf' | 'excel';

export type ReportFilterStatus = CampaignStatus | 'all';

export interface ReportFilters {
  from: string;
  to: string;
  status: ReportFilterStatus;
  clientId: string | 'all';
}

export interface ReportMetric {
  key: string;
  label: string;
  value: number;
  unit?: 'mad' | 'percentage' | 'count';
  trend?: number;
}

export interface ReportStatusBreakdownItem {
  status: CampaignStatus;
  count: number;
}

export interface ReportRow {
  id: string;
  campaign: string;
  client: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string | null;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number;
  conversions: number;
  roi: number;
}

export interface ReportSeriesPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
}

export interface ReportPreview {
  filters: ReportFilters;
  metrics: ReportMetric[];
  statusBreakdown: ReportStatusBreakdownItem[];
  rows: ReportRow[];
  series: ReportSeriesPoint[];
  availableClients: Array<{ id: string | null; name: string }>;
  generatedAt: string;
  totalRows: number;
  summary: {
    totalSpend: number;
    totalImpressions: number;
    totalClicks: number;
    averageCtr: number;
    averageRoi: number;
  };
}
