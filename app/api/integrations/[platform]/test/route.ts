import { NextResponse } from 'next/server'

import { loadServerEnv } from '@/lib/load-server-env'
import { applyRateLimit, getSupabaseSession, normalizePlatform } from '../../utils'

import type { NextRequest } from 'next/server'

const RATE_LIMIT = { limit: 10, windowMs: 60_000 }

type TestPayload = {
  api_key?: string | null
  api_secret?: string | null
  access_token?: string | null
  refresh_token?: string | null
}

function hasAnyCredentials(payload: TestPayload) {
  return ['api_key', 'api_secret', 'access_token', 'refresh_token'].some((key) => {
    const value = payload[key as keyof TestPayload]
    return typeof value === 'string' && value.trim().length > 0
  })
}

function simulateIntegrationTest(platform: string) {
  return {
    success: true,
    message: `${platform.toUpperCase()} credentials verified successfully (simulated test).`,
  }
}

export async function POST(request: NextRequest, context: { params: { platform?: string } }) {
  loadServerEnv()

  const rateLimitResponse = applyRateLimit(request, 'test', RATE_LIMIT.limit, RATE_LIMIT.windowMs)
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

  let payload: TestPayload
  try {
    payload = await request.json()
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!hasAnyCredentials(payload)) {
    return NextResponse.json({ success: false, message: 'Credentials are required for testing.' }, { status: 400 })
  }

  const result = simulateIntegrationTest(platform)
  return NextResponse.json(result)
}
