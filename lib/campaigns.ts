import { addDays, compareAsc, isValid, parseISO } from 'date-fns'
import { ZodError } from 'zod'

import type { Campaign, CampaignMilestone, CampaignMilestoneStatus, CampaignStatus } from '@/types'

export const CAMPAIGN_STATUSES = ['planned', 'active', 'paused', 'completed', 'archived'] as const
export const CAMPAIGN_MILESTONE_STATUSES = ['pending', 'in_progress', 'completed'] as const

export type CampaignStatusOption = (typeof CAMPAIGN_STATUSES)[number]
export type CampaignMilestoneStatusOption = (typeof CAMPAIGN_MILESTONE_STATUSES)[number]

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatusOption, string> = {
  planned: 'Planned',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
}

export const CAMPAIGN_MILESTONE_STATUS_LABELS: Record<CampaignMilestoneStatusOption, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
}

const UUID_REGEX = /^[0-9a-fA-F-]{36}$/

type ValidationIssue = { path: (string | number)[]; message: string }

function throwIssue(issue: ValidationIssue): never {
  throw new ZodError([issue])
}

function normalizeString(
  value: unknown,
  path: (string | number)[],
  options: { min?: number; max?: number; allowEmpty?: boolean } = {},
) {
  if (typeof value !== 'string') {
    throwIssue({ path, message: 'Expected string' })
  }

  const trimmed = value.trim()
  if (!options.allowEmpty && trimmed.length === 0) {
    throwIssue({ path, message: 'Value cannot be empty' })
  }

  if (options.min !== undefined && trimmed.length < options.min) {
    throwIssue({ path, message: `Must contain at least ${options.min} characters` })
  }

  if (options.max !== undefined && trimmed.length > options.max) {
    throwIssue({ path, message: `Must contain at most ${options.max} characters` })
  }

  return trimmed
}

function normalizeOptionalString(value: unknown, path: (string | number)[], options: { max?: number } = {}) {
  if (value === null || value === undefined || value === '') {
    return undefined
  }
  return normalizeString(value, path, { allowEmpty: true, max: options.max })
}

function normalizeStatus(value: unknown, path: (string | number)[]): CampaignStatusOption {
  if (typeof value !== 'string') {
    throwIssue({ path, message: 'Expected status string' })
  }
  if (!CAMPAIGN_STATUSES.includes(value as CampaignStatusOption)) {
    throwIssue({ path, message: `Status must be one of: ${CAMPAIGN_STATUSES.join(', ')}` })
  }
  return value as CampaignStatusOption
}

function normalizeMilestoneStatus(value: unknown, path: (string | number)[]): CampaignMilestoneStatusOption {
  if (typeof value !== 'string') {
    throwIssue({ path, message: 'Expected milestone status' })
  }
  if (!CAMPAIGN_MILESTONE_STATUSES.includes(value as CampaignMilestoneStatusOption)) {
    throwIssue({ path, message: `Milestone status must be one of: ${CAMPAIGN_MILESTONE_STATUSES.join(', ')}` })
  }
  return value as CampaignMilestoneStatusOption
}

function normalizeDateOnly(value: unknown, path: (string | number)[]): string {
  if (typeof value !== 'string') {
    throwIssue({ path, message: 'Expected date string' })
  }
  const parsed = parseISO(value)
  if (!isValid(parsed)) {
    throwIssue({ path, message: 'Expected ISO date (YYYY-MM-DD)' })
  }
  return toDateOnly(parsed)
}

function normalizeClientId(value: unknown, path: (string | number)[]): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }
  const id = normalizeString(value, path)
  if (!UUID_REGEX.test(id)) {
    throwIssue({ path, message: 'Client id must be a valid UUID' })
  }
  return id
}

export type CampaignMilestoneInput = {
  id?: string
  label: string
  date: string
  status?: CampaignMilestoneStatusOption
}

function sanitizeMilestones(value: unknown, path: (string | number)[]): CampaignMilestoneInput[] | undefined {
  if (value === null || value === undefined) {
    return undefined
  }

  if (!Array.isArray(value)) {
    throwIssue({ path, message: 'Milestones must be an array' })
  }

  if (value.length > 20) {
    throwIssue({ path, message: 'Provide at most 20 milestones' })
  }

  return value.map((raw, index) => {
    if (typeof raw !== 'object' || raw === null) {
      throwIssue({ path: [...path, index], message: 'Milestone must be an object' })
    }

    const label = normalizeString((raw as Record<string, unknown>).label, [...path, index, 'label'], { min: 2, max: 160 })
    const date = normalizeDateOnly((raw as Record<string, unknown>).date, [...path, index, 'date'])
    const status = (raw as Record<string, unknown>).status
      ? normalizeMilestoneStatus((raw as Record<string, unknown>).status, [...path, index, 'status'])
      : undefined
    const idValue = (raw as Record<string, unknown>).id
    const id = idValue ? normalizeString(idValue, [...path, index, 'id'], { allowEmpty: false }) : undefined

    return { id, label, date, status }
  })
}

export type CampaignFormInput = {
  name: string
  clientId: string | null
  status: CampaignStatusOption
  startDate: string
  endDate?: string
  description?: string
  milestones?: CampaignMilestoneInput[]
}

export type CampaignUpdateInput = Partial<CampaignFormInput>

export type CampaignQueryInput = {
  clientId?: string
  status?: CampaignStatusOption
  from?: string
  to?: string
}

export type CampaignReorderInput = {
  order: string[]
}

export type CampaignRow = {
  id: string
  user_id: string
  client_id: string | null
  name: string
  description: string | null
  status: CampaignStatus
  start_date: string
  end_date: string | null
  position: number
  milestones: CampaignMilestone[] | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  clients?: { name: string | null } | { name: string | null }[] | null
}

function ensureId() {
  if (typeof globalThis !== 'undefined' && typeof globalThis.crypto !== 'undefined' && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID()
  }
  return `cmp_${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`
}

function toDateOnly(value: Date | string) {
  const date = value instanceof Date ? value : parseISO(value)
  if (!isValid(date)) {
    throw new Error('invalid_date')
  }
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type NormalizeMilestoneOptions = {
  startDate: string
  endDate?: string | null
}

export function normalizeCampaignMilestones(
  milestones: CampaignMilestoneInput[] | undefined,
  options: NormalizeMilestoneOptions,
): CampaignMilestone[] {
  const candidateMilestones = (milestones ?? []).map((item) => ({ ...item }))

  const startBoundary = parseISO(options.startDate)
  const endBoundary = options.endDate ? parseISO(options.endDate) : null

  if (candidateMilestones.length === 0) {
    const start = parseISO(options.startDate)
    const plannedLaunch = options.endDate ? parseISO(options.endDate) : addDays(start, 14)
    const wrapUp = options.endDate ? addDays(parseISO(options.endDate), 7) : addDays(start, 30)

    candidateMilestones.push(
      { id: ensureId(), label: 'Kickoff', date: toDateOnly(options.startDate), status: 'in_progress' },
      { id: ensureId(), label: 'Launch campaign assets', date: toDateOnly(plannedLaunch), status: 'pending' },
      { id: ensureId(), label: 'Performance review', date: toDateOnly(wrapUp), status: 'pending' },
    )
  }

  const normalized: CampaignMilestone[] = candidateMilestones.map((milestone) => {
    const status = CAMPAIGN_MILESTONE_STATUSES.includes(
      (milestone.status ?? 'pending') as CampaignMilestoneStatusOption,
    )
      ? ((milestone.status ?? 'pending') as CampaignMilestoneStatus)
      : 'pending'

    const dateValue = parseISO(milestone.date)
    if (compareAsc(dateValue, startBoundary) === -1) {
      throwIssue({ path: ['milestones'], message: 'Milestones must occur on or after the kickoff date' })
    }
    if (endBoundary && compareAsc(dateValue, endBoundary) === 1) {
      throwIssue({ path: ['milestones'], message: 'Milestones must occur before the wrap-up date' })
    }

    return {
      id: milestone.id ?? ensureId(),
      label: milestone.label.trim(),
      date: toDateOnly(milestone.date),
      status,
    }
  })

  normalized.sort((a, b) => compareAsc(parseISO(a.date), parseISO(b.date)))

  return normalized
}

export function mapCampaign(row: CampaignRow): Campaign {
  const clientValue = row.clients
  let clientName: string | undefined
  if (Array.isArray(clientValue)) {
    clientName = clientValue[0]?.name ?? undefined
  } else if (clientValue && typeof clientValue === 'object') {
    clientName = clientValue.name ?? undefined
  }

  return {
    id: row.id,
    user_id: row.user_id,
    client_id: row.client_id,
    client_name: clientName,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status,
    startDate: toDateOnly(row.start_date),
    endDate: row.end_date ? toDateOnly(row.end_date) : null,
    position: row.position,
    milestones: Array.isArray(row.milestones)
      ? row.milestones.map((milestone) => ({
          id: milestone.id ?? ensureId(),
          label: milestone.label,
          date: toDateOnly(milestone.date),
          status: (milestone.status ?? 'pending') as CampaignMilestoneStatus,
        }))
      : [],
    metadata: row.metadata ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export type CampaignAnalyticsEvent = 'campaign_created'

export function trackCampaignEvent(event: CampaignAnalyticsEvent, payload: { campaign_id: string }) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[analytics] ${event}`, payload)
  }

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.dispatchEvent(new CustomEvent('campaigns:analytics', { detail: { ...payload, event, timestamp: Date.now() } }))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to dispatch campaign analytics event', error)
    }
  }
}

export function parseCampaignForm(input: unknown): CampaignFormInput {
  if (typeof input !== 'object' || input === null) {
    throwIssue({ path: [], message: 'Invalid request payload' })
  }

  const raw = input as Record<string, unknown>

  const name = normalizeString(raw.name, ['name'], { min: 3, max: 180 })
  const clientId = normalizeClientId(raw.clientId, ['clientId'])
  const status = normalizeStatus(raw.status ?? 'planned', ['status'])
  const startDate = normalizeDateOnly(raw.startDate, ['startDate'])
  const endDateValue = raw.endDate === undefined || raw.endDate === null || raw.endDate === '' ? null : normalizeDateOnly(raw.endDate, ['endDate'])

  if (endDateValue && compareAsc(parseISO(startDate), parseISO(endDateValue)) === 1) {
    throwIssue({ path: ['endDate'], message: 'Wrap-up date must come after the kickoff date' })
  }

  const description = normalizeOptionalString(raw.description, ['description'], { max: 2000 })
  const milestones = sanitizeMilestones(raw.milestones, ['milestones'])

  return {
    name,
    clientId,
    status,
    startDate,
    endDate: endDateValue ?? undefined,
    description,
    milestones,
  }
}

export function parseCampaignUpdate(input: unknown): CampaignUpdateInput {
  if (typeof input !== 'object' || input === null) {
    throwIssue({ path: [], message: 'Invalid request payload' })
  }

  const raw = input as Record<string, unknown>
  const result: CampaignUpdateInput = {}

  if (Object.prototype.hasOwnProperty.call(raw, 'name')) {
    result.name = normalizeString(raw.name, ['name'], { min: 3, max: 180 })
  }

  if (Object.prototype.hasOwnProperty.call(raw, 'clientId')) {
    result.clientId = normalizeClientId(raw.clientId, ['clientId'])
  }

  if (Object.prototype.hasOwnProperty.call(raw, 'status')) {
    result.status = normalizeStatus(raw.status, ['status'])
  }

  if (Object.prototype.hasOwnProperty.call(raw, 'startDate')) {
    result.startDate = normalizeDateOnly(raw.startDate, ['startDate'])
  }

  if (Object.prototype.hasOwnProperty.call(raw, 'endDate')) {
    const endInput = raw.endDate
    if (endInput === null || endInput === undefined || endInput === '') {
      result.endDate = undefined
    } else {
      result.endDate = normalizeDateOnly(endInput, ['endDate'])
    }
  }

  if (Object.prototype.hasOwnProperty.call(raw, 'description')) {
    result.description = normalizeOptionalString(raw.description, ['description'], { max: 2000 })
  }

  if (Object.prototype.hasOwnProperty.call(raw, 'milestones')) {
    result.milestones = sanitizeMilestones(raw.milestones, ['milestones'])
  }

  if (Object.keys(result).length === 0) {
    throwIssue({ path: [], message: 'Provide at least one field to update' })
  }

  return result
}

export function parseCampaignQuery(input: unknown): CampaignQueryInput {
  if (typeof input !== 'object' || input === null) {
    return {}
  }

  const raw = input as Record<string, unknown>
  const query: CampaignQueryInput = {}

  if (raw.clientId !== undefined && raw.clientId !== null && raw.clientId !== '') {
    const clientId = normalizeClientId(raw.clientId, ['clientId'])
    if (clientId) {
      query.clientId = clientId
    }
  }

  if (raw.status !== undefined && raw.status !== null && raw.status !== '') {
    query.status = normalizeStatus(raw.status, ['status'])
  }

  if (raw.from) {
    query.from = normalizeDateOnly(raw.from, ['from'])
  }

  if (raw.to) {
    query.to = normalizeDateOnly(raw.to, ['to'])
  }

  if (query.from && query.to && compareAsc(parseISO(query.from), parseISO(query.to)) === 1) {
    throwIssue({ path: ['from'], message: 'The from date must be before the to date' })
  }

  return query
}

export function parseCampaignReorder(input: unknown): CampaignReorderInput {
  if (typeof input !== 'object' || input === null) {
    throwIssue({ path: [], message: 'Invalid reorder payload' })
  }

  const raw = input as Record<string, unknown>
  if (!Array.isArray(raw.order)) {
    throwIssue({ path: ['order'], message: 'Order must be an array of ids' })
  }

  const order = raw.order.map((value, index) => {
    const id = normalizeString(value, ['order', index], { allowEmpty: false })
    if (!UUID_REGEX.test(id)) {
      throwIssue({ path: ['order', index], message: 'Each id must be a UUID' })
    }
    return id
  })

  if (order.length === 0) {
    throwIssue({ path: ['order'], message: 'Provide at least one id to reorder' })
  }

  return { order }
}

export function normalizeCampaignDate(value: string) {
  return toDateOnly(value)
}

export { ZodError }
