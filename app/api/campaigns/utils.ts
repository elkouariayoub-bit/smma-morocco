import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

import type { NextRequest } from 'next/server'

import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

export async function getSupabaseSession() {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Error retrieving Supabase session for campaigns API', error)
    throw new Error('session_error')
  }

  return { supabase, userId: session?.user.id ?? null }
}

export function applyCampaignsRateLimit(
  request: NextRequest,
  action: string,
  limit = 40,
  windowMs = 60_000,
) {
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]
  const identifier = getRateLimitIdentifier(ip, `campaigns-${action}`)
  const result = checkRateLimit(identifier, limit, windowMs)

  if (!result.allowed) {
    const headers: Record<string, string> = {}
    if (result.retryAfter !== undefined) {
      headers['Retry-After'] = Math.ceil(result.retryAfter / 1000).toString()
    }

    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers })
  }

  return null
}
