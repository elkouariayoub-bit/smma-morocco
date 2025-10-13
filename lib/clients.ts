import type { Client } from '@/types'
import { decrypt, encrypt } from './encryption'
import { z, ZodError, infer as inferSchema } from 'zod'

export const CLIENT_STATUSES = ['active', 'inactive'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

const CLIENT_STATUS_OPTIONS = [...CLIENT_STATUSES] as [ClientStatus, ...ClientStatus[]]

export const clientFormSchema = z.object({
  name: z.string().trim().min(2).max(120),
  contact: z.string().trim().min(3).max(320),
  status: z.enum(CLIENT_STATUS_OPTIONS).default('active'),
})

export type ClientFormInput = inferSchema<typeof clientFormSchema>

export const clientQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().max(120).optional(),
  })

export type ClientQuery = inferSchema<typeof clientQuerySchema>

export type ClientRow = {
  id: string
  user_id: string
  name: string
  contact_encrypted: string
  status: ClientStatus
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export function decryptContact(encrypted: string): string {
  try {
    return decrypt(encrypted)
  } catch (error) {
    console.error('Failed to decrypt client contact details', error)
    throw new Error('decrypt_error')
  }
}

export function encryptContact(value: string): string {
  try {
    return encrypt(value)
  } catch (error) {
    console.error('Failed to encrypt client contact details', error)
    throw new Error('encrypt_error')
  }
}

export function mapClient(row: ClientRow, contact: string): Client {
  return {
    id: row.id,
    user_id: row.user_id,
    name: row.name,
    contact,
    status: row.status,
    metadata: row.metadata ?? undefined,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export type ClientAnalyticsEvent = 'client_added' | 'client_edited' | 'client_deleted'

export function trackClientEvent(event: ClientAnalyticsEvent, payload: { client_id: string }) {
  if (process.env.NODE_ENV !== 'production') {
    console.info(`[analytics] ${event}`, payload)
  }

  if (typeof window === 'undefined') {
    return
  }

  const detail = { ...payload, event, timestamp: Date.now() }
  try {
    window.dispatchEvent(new CustomEvent('clients:analytics', { detail }))
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Failed to dispatch client analytics event', error)
    }
  }
}

export function parseClientForm(input: unknown) {
  const result = clientFormSchema.safeParse(input)
  if (!result.success) {
    throw result.error
  }
  return result.data
}

export function parseClientQuery(input: unknown) {
  const result = clientQuerySchema.safeParse(input)
  if (!result.success) {
    throw result.error
  }
  return result.data
}

export { ZodError }
