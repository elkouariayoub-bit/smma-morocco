export const SETTINGS_THEME_OPTIONS = ['light', 'dark'] as const
export type SettingsTheme = (typeof SETTINGS_THEME_OPTIONS)[number]

export type SettingsNotifications = {
  campaignSummaries: boolean
  performanceAlerts: boolean
}

export const DEFAULT_NOTIFICATIONS: SettingsNotifications = {
  campaignSummaries: true,
  performanceAlerts: true,
}

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية', direction: 'rtl' as const },
] as const

export const TIMEZONE_OPTIONS = [
  { value: 'Africa/Casablanca', label: 'Africa/Casablanca (GMT+1)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+2)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-4)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GMT+4)' },
] as const

export interface SettingsView {
  id: string
  userId: string
  fullName: string
  company: string
  role: string
  contactEmail: string
  language: string
  timezone: string
  theme: SettingsTheme
  apiKeyLabel?: string | null
  apiKeyLastFour?: string | null
  hasApiKey: boolean
  notifications: SettingsNotifications
  createdAt: string
  updatedAt: string
}
