import { NextResponse } from 'next/server'

import { loadServerEnv } from '@/lib/load-server-env'
import { applyRateLimit, getSupabaseSession } from './utils'

import type { NextRequest } from 'next/server'

const RATE_LIMIT = { limit: 30, windowMs: 60_000 }

export async function GET(request: NextRequest) {
  loadServerEnv()

  const rateLimitResponse = applyRateLimit(request, 'index', RATE_LIMIT.limit, RATE_LIMIT.windowMs)
  if (rateLimitResponse) {
    return rateLimitResponse
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
    .select('id, platform, is_connected, created_at, updated_at')
    .eq('user_id', userId)
    .order('platform', { ascending: true })

  if (error) {
    console.error('Error fetching integrations', error)
    return NextResponse.json({ error: 'Unable to load integrations' }, { status: 500 })
  }

  return NextResponse.json({ integrations: data ?? [] })
}
