import { NextResponse } from 'next/server'

import { applySupabaseCookies, createClient } from '@/lib/supabase'

import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'

import type { NextRequest } from 'next/server'

export async function getSupabaseSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next()
  const supabase = createClient({ request, response: supabaseResponse })
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Error retrieving Supabase session for clients API', error)
    throw new Error('session_error')
  }

  return { supabase, session, userId: session?.user.id ?? null, response: supabaseResponse }
}

export function applyClientsRateLimit(
  request: NextRequest,
  action: string,
  limit = 40,
  windowMs = 60_000,
) {
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]
  const identifier = getRateLimitIdentifier(ip, `clients-${action}`)
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

export function withSupabaseCookies(base: NextResponse, supabaseResponse: NextResponse) {
  applySupabaseCookies(supabaseResponse, base)
  return base
}
