import 'server-only'

import { createHash } from 'node:crypto'
import { ZodError } from 'zod'

import { encrypt } from '@/lib/encryption'
import { supabaseServer } from '@/lib/supabaseServer'
import {
  DEFAULT_NOTIFICATIONS,
  SETTINGS_THEME_OPTIONS,
  type SettingsNotifications,
  type SettingsTheme,
  type SettingsView,
} from './settings-shared'

const SETTINGS_COLUMNS =
  'id, user_id, full_name, company, role, contact_email, language, timezone, theme, api_key_label, api_key_last_four, api_key_hash, notifications, created_at, updated_at'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_NAME_LENGTH = 2
const MIN_API_KEY_LENGTH = 16

export type ProfileInput = {
  fullName: string
  company?: string
  role?: string
  contactEmail: string
  language: string
  timezone: string
}

export type ApiKeyInput = {
  apiKey: string
  label?: string
}

export type PreferencesInput = {
  theme?: SettingsTheme
  notifications?: SettingsNotifications
}

export type SettingsPatch =
  | { type: 'theme'; theme: SettingsTheme }
  | { type: 'profile'; data: ProfileInput }
  | { type: 'apiKey'; data: ApiKeyInput }
  | { type: 'apiKeyRevoke' }
  | { type: 'preferences'; data: PreferencesInput }

type UserSettingsRow = {
  id: string
  user_id: string
  full_name: string | null
  company: string | null
  role: string | null
  contact_email: string | null
  language: string | null
  timezone: string | null
  theme: string | null
  api_key_label: string | null
  api_key_last_four: string | null
  api_key_hash: string | null
  notifications: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export function parseSettingsPatch(input: unknown): SettingsPatch {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ZodError([{ path: [], message: 'Invalid settings payload' }])
  }

  const record = input as Record<string, unknown>
  const rawSection = typeof record.section === 'string' ? record.section.toLowerCase() : undefined

  if (rawSection === 'profile') {
    return { type: 'profile', data: parseProfilePayload(record) }
  }

  if (rawSection === 'apikey') {
    const action = typeof record.action === 'string' ? record.action.toLowerCase() : undefined
    if (action === 'revoke') {
      return { type: 'apiKeyRevoke' }
    }
    return { type: 'apiKey', data: parseApiKeyPayload(record) }
  }

  if (rawSection === 'preferences') {
    return { type: 'preferences', data: parsePreferencesPayload(record) }
  }

  if (rawSection === 'theme' || 'theme' in record) {
    return { type: 'theme', theme: parseThemeValue(record.theme) }
  }

  throw new ZodError([{ path: [], message: 'Invalid settings payload' }])
}

export async function getOrCreateUserSettings(
  userId: string,
  defaults: Partial<{ email: string | null | undefined; fullName: string | null | undefined; role: string | null | undefined }> = {},
): Promise<SettingsView> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('user_settings')
    .select(SETTINGS_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to load user settings', error)
    throw new Error('settings_load_error')
  }

  if (data) {
    return mapRowToView(data as UserSettingsRow)
  }

  const { data: inserted, error: insertError } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
      contact_email: defaults.email ?? null,
      full_name: defaults.fullName ?? null,
      role: defaults.role ?? null,
    })
    .select(SETTINGS_COLUMNS)
    .single()

  if (insertError || !inserted) {
    console.error('Failed to initialize user settings', insertError)
    throw new Error('settings_create_error')
  }

  return mapRowToView(inserted as UserSettingsRow)
}

export async function updateProfileSettings(userId: string, input: ProfileInput): Promise<SettingsView> {
  const supabase = await supabaseServer()
  const payload = {
    full_name: input.fullName.trim(),
    company: input.company?.trim() || null,
    role: input.role?.trim() || null,
    contact_email: input.contactEmail.trim(),
    language: input.language,
    timezone: input.timezone,
  }

  const { data, error } = await supabase
    .from('user_settings')
    .update(payload)
    .eq('user_id', userId)
    .select(SETTINGS_COLUMNS)
    .single()

  if (error || !data) {
    console.error('Failed to update profile settings', error)
    throw new Error('settings_update_error')
  }

  return mapRowToView(data as UserSettingsRow)
}

export async function updateThemeSetting(userId: string, theme: SettingsTheme): Promise<SettingsView> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('user_settings')
    .update({ theme })
    .eq('user_id', userId)
    .select(SETTINGS_COLUMNS)
    .single()

  if (error || !data) {
    console.error('Failed to update theme preference', error)
    throw new Error('settings_update_error')
  }

  return mapRowToView(data as UserSettingsRow)
}

export async function updatePreferenceSettings(userId: string, input: PreferencesInput): Promise<SettingsView> {
  const supabase = await supabaseServer()

  const update: Record<string, unknown> = {}
  if (input.theme) {
    update.theme = input.theme
  }
  if (input.notifications) {
    update.notifications = normalizeNotifications(input.notifications)
  }

  if (!Object.keys(update).length) {
    return getOrCreateUserSettings(userId)
  }

  const { data, error } = await supabase
    .from('user_settings')
    .update(update)
    .eq('user_id', userId)
    .select(SETTINGS_COLUMNS)
    .single()

  if (error || !data) {
    console.error('Failed to update preferences', error)
    throw new Error('settings_update_error')
  }

  return mapRowToView(data as UserSettingsRow)
}

export async function saveApiKey(userId: string, input: ApiKeyInput): Promise<SettingsView> {
  const supabase = await supabaseServer()

  const trimmedKey = input.apiKey.trim()
  const encryptedKey = encrypt(trimmedKey)
  const hash = hashSecret(trimmedKey)
  const lastFour = trimmedKey.slice(-4)

  const { data, error } = await supabase
    .from('user_settings')
    .update({
      api_key_encrypted: encryptedKey,
      api_key_hash: hash,
      api_key_label: input.label?.trim() || null,
      api_key_last_four: lastFour,
    })
    .eq('user_id', userId)
    .select(SETTINGS_COLUMNS)
    .single()

  if (error || !data) {
    console.error('Failed to store API key', error)
    throw new Error('settings_update_error')
  }

  return mapRowToView(data as UserSettingsRow)
}

export async function revokeApiKey(userId: string): Promise<SettingsView> {
  const supabase = await supabaseServer()

  const { data, error } = await supabase
    .from('user_settings')
    .update({
      api_key_encrypted: null,
      api_key_hash: null,
      api_key_label: null,
      api_key_last_four: null,
    })
    .eq('user_id', userId)
    .select(SETTINGS_COLUMNS)
    .single()

  if (error || !data) {
    console.error('Failed to revoke API key', error)
    throw new Error('settings_update_error')
  }

  return mapRowToView(data as UserSettingsRow)
}

export async function recordSettingsEvent(userId: string, metadata: Record<string, unknown>) {
  try {
    const supabase = await supabaseServer()
    await supabase.from('dashboard_events').insert({
      user_id: userId,
      event_name: 'settings_updated',
      metadata,
    })
  } catch (error) {
    console.error('Failed to record settings analytics event', error)
  }
}

function mapRowToView(row: UserSettingsRow): SettingsView {
  const theme = SETTINGS_THEME_OPTIONS.includes((row.theme ?? 'dark') as SettingsTheme)
    ? ((row.theme ?? 'dark') as SettingsTheme)
    : 'dark'

  const notifications = normalizeNotifications(row.notifications)

  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name ?? '',
    company: row.company ?? '',
    role: row.role ?? '',
    contactEmail: row.contact_email ?? '',
    language: row.language ?? 'en',
    timezone: row.timezone ?? 'Africa/Casablanca',
    theme,
    apiKeyLabel: row.api_key_label,
    apiKeyLastFour: row.api_key_last_four,
    hasApiKey: Boolean(row.api_key_hash),
    notifications,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

type StringOptions = {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message?: string
}

function expectRequiredString(record: Record<string, unknown>, key: string, options: StringOptions = {}): string {
  const value = expectOptionalString(record, key, options)
  if (value === undefined) {
    throwIssue([key], options.message ?? `${key} is required`)
  }
  return value
}

function expectOptionalString(record: Record<string, unknown>, key: string, options: StringOptions = {}): string | undefined {
  const raw = record[key]
  if (raw === undefined || raw === null) {
    return undefined
  }
  if (typeof raw !== 'string') {
    throwIssue([key], options.message ?? `${key} must be a string`)
  }
  const value = raw.trim()
  if (!value) {
    return undefined
  }
  if (options.minLength && value.length < options.minLength) {
    throwIssue([key], options.message ?? `${key} must be at least ${options.minLength} characters long`)
  }
  if (options.maxLength && value.length > options.maxLength) {
    throwIssue([key], options.message ?? `${key} must be at most ${options.maxLength} characters long`)
  }
  if (options.pattern && !options.pattern.test(value)) {
    throwIssue([key], options.message ?? `${key} is invalid`)
  }
  return value
}

function parseProfilePayload(record: Record<string, unknown>): ProfileInput {
  const fullName = expectRequiredString(record, 'fullName', {
    minLength: MIN_NAME_LENGTH,
    message: 'Full name is required',
  })
  const contactEmail = expectRequiredString(record, 'contactEmail', {
    pattern: EMAIL_PATTERN,
    message: 'Enter a valid email address',
  })
  const language = expectRequiredString(record, 'language', { minLength: 2, message: 'Language is required' })
  const timezone = expectRequiredString(record, 'timezone', { minLength: 2, message: 'Timezone is required' })
  const company = expectOptionalString(record, 'company')
  const role = expectOptionalString(record, 'role')

  return {
    fullName,
    contactEmail,
    language,
    timezone,
    ...(company ? { company } : {}),
    ...(role ? { role } : {}),
  }
}

function parseApiKeyPayload(record: Record<string, unknown>): ApiKeyInput {
  const apiKey = expectRequiredString(record, 'apiKey', {
    minLength: MIN_API_KEY_LENGTH,
    message: 'API key must be at least 16 characters',
  })
  const label = expectOptionalString(record, 'label')

  return label ? { apiKey, label } : { apiKey }
}

function parsePreferencesPayload(record: Record<string, unknown>): PreferencesInput {
  const preferences: PreferencesInput = {}

  if ('theme' in record) {
    preferences.theme = parseThemeValue(record.theme)
  }

  if ('notifications' in record) {
    preferences.notifications = normalizeNotifications(record.notifications)
  }

  return preferences
}

function parseThemeValue(value: unknown, path: (string | number)[] = ['theme']): SettingsTheme {
  if (typeof value !== 'string') {
    throwIssue(path, 'Theme must be a string')
  }
  const normalized = value.trim().toLowerCase()
  if (normalized === 'light' || normalized === 'dark') {
    return normalized as SettingsTheme
  }
  throwIssue(path, 'Theme must be "light" or "dark"')
}

function normalizeNotifications(value: unknown): SettingsNotifications {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { ...DEFAULT_NOTIFICATIONS }
  }

  const record = value as Record<string, unknown>
  const campaignSummaries =
    typeof record.campaignSummaries === 'boolean'
      ? record.campaignSummaries
      : DEFAULT_NOTIFICATIONS.campaignSummaries
  const performanceAlerts =
    typeof record.performanceAlerts === 'boolean'
      ? record.performanceAlerts
      : DEFAULT_NOTIFICATIONS.performanceAlerts

  return { campaignSummaries, performanceAlerts }
}

function hashSecret(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function throwIssue(path: (string | number)[], message: string): never {
  throw new ZodError([{ path, message }])
}
