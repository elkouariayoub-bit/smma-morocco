import { NextResponse } from 'next/server'
import { loadServerEnv } from '@/lib/load-server-env'
import { encryptSecret } from '@/lib/encryption'
import { applyRateLimit, getSupabaseSession, normalizePlatform } from '../utils'

import type { NextRequest } from 'next/server'

const RATE_LIMIT = { limit: 20, windowMs: 60_000 }

type IntegrationPayload = {
  api_key?: string | null
  api_secret?: string | null
  access_token?: string | null
  refresh_token?: string | null
  metadata?: Record<string, unknown>
  expires_at?: string | null
}

export async function GET(request: NextRequest, context: { params: { platform?: string } }) {
  loadServerEnv()

  const rateLimitResponse = applyRateLimit(request, 'get', RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const platform = normalizePlatform(context.params.platform)
  if (!platform) {
    return NextResponse.json({ error: 'Unsupported integration platform' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession()
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabase, userId } = session
  const { data, error } = await supabase
    .from('user_integrations')
    .select('id, platform, is_connected, metadata, created_at, updated_at, expires_at')
    .eq('user_id', userId)
    .eq('platform', platform)
    .maybeSingle()

  if (error) {
    console.error('Error loading integration detail', error)
    return NextResponse.json({ error: 'Unable to load integration' }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ integration: null })
  }

  return NextResponse.json({ integration: data })
}

export async function POST(request: NextRequest, context: { params: { platform?: string } }) {
  loadServerEnv()

  const rateLimitResponse = applyRateLimit(request, 'post', RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const platform = normalizePlatform(context.params.platform)
  if (!platform) {
    return NextResponse.json({ error: 'Unsupported integration platform' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession()
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: IntegrationPayload
  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {
    user_id: session.userId,
    platform,
  }

  const sensitiveKeys: (keyof IntegrationPayload)[] = ['api_key', 'api_secret', 'access_token', 'refresh_token']
  let hasCredentialUpdate = false
  let touchedSensitive = false

  for (const key of sensitiveKeys) {
    if (key in payload) {
      touchedSensitive = true
      const rawValue = payload[key]
      const value = typeof rawValue === 'string' && rawValue.trim().length > 0 ? rawValue : null
      updates[key] = encryptSecret(value)
      if (value) {
        hasCredentialUpdate = true
      }
    }
  }

  if ('metadata' in payload) {
    updates.metadata = payload.metadata ?? null
  }

  if ('expires_at' in payload) {
    updates.expires_at = payload.expires_at ?? null
  }

  if (hasCredentialUpdate) {
    updates.is_connected = true
  } else if (touchedSensitive) {
    updates.is_connected = false
  } else if ('is_connected' in payload) {
    updates.is_connected = Boolean((payload as { is_connected?: boolean }).is_connected)
  }

  const keysToUpdate = Object.keys(updates).filter((key) => !['user_id', 'platform'].includes(key))
  if (keysToUpdate.length === 0) {
    return NextResponse.json({ error: 'No fields provided for update' }, { status: 400 })
  }

  const { supabase } = session
  const { data, error } = await supabase
    .from('user_integrations')
    .upsert(updates, { onConflict: 'user_id,platform', ignoreDuplicates: false })
    .select('id, platform, is_connected, metadata, created_at, updated_at, expires_at')
    .maybeSingle()

  if (error) {
    console.error('Error saving integration', error)
    return NextResponse.json({ error: 'Unable to save integration' }, { status: 500 })
  }

  return NextResponse.json({ integration: data, updated: true })
}

export async function DELETE(request: NextRequest, context: { params: { platform?: string } }) {
  loadServerEnv()

  const rateLimitResponse = applyRateLimit(request, 'delete', RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  const platform = normalizePlatform(context.params.platform)
  if (!platform) {
    return NextResponse.json({ error: 'Unsupported integration platform' }, { status: 400 })
  }

  let session
  try {
    session = await getSupabaseSession()
  } catch (error) {
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabase, userId } = session
  const { error } = await supabase
    .from('user_integrations')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform)

  if (error) {
    console.error('Error disconnecting integration', error)
    return NextResponse.json({ error: 'Unable to disconnect integration' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
