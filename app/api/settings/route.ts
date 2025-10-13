import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ZodError } from 'zod'

import { loadServerEnv } from '@/lib/load-server-env'
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit'
import {
  getOrCreateUserSettings,
  parseSettingsPatch,
  recordSettingsEvent,
  revokeApiKey,
  saveApiKey,
  updatePreferenceSettings,
  updateProfileSettings,
  updateThemeSetting,
} from '@/lib/settings'
import type { SettingsView } from '@/lib/settings-shared'
import { applySupabaseCookies, createClient } from '@/lib/supabase'

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 20

function applyRateLimit(request: NextRequest, action: string) {
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const identifier = getRateLimitIdentifier(ip, `settings-${action}`)
  const result = checkRateLimit(identifier, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)

  if (!result.allowed) {
    const headers: Record<string, string> = {}
    if (result.retryAfter !== undefined) {
      headers['Retry-After'] = Math.ceil(result.retryAfter / 1000).toString()
    }

    return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers })
  }

  return null
}

export async function GET(request: NextRequest) {
  loadServerEnv()

  const rateLimited = applyRateLimit(request, 'get')
  if (rateLimited) {
    return rateLimited
  }

  const supabaseResponse = NextResponse.next()
  const supabase = createClient({ request, response: supabaseResponse })
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Unable to verify Supabase session for settings request', error)
    const response = NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  const user = session?.user
  if (!user?.id) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  try {
    const settings = await getOrCreateUserSettings(user.id, {
      email: user.email,
      fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      role: typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined,
    })

    const response = NextResponse.json({ settings })
    applySupabaseCookies(supabaseResponse, response)
    return response
  } catch (settingsError) {
    console.error('Failed to load user settings', settingsError)
    const response = NextResponse.json({ error: 'Unable to load settings' }, { status: 500 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }
}

export async function PATCH(request: NextRequest) {
  loadServerEnv()

  const rateLimited = applyRateLimit(request, 'patch')
  if (rateLimited) {
    return rateLimited
  }

  const supabaseResponse = NextResponse.next()
  const supabase = createClient({ request, response: supabaseResponse })
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Unable to verify Supabase session for settings update', error)
    const response = NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  const user = session?.user
  if (!user?.id) {
    const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    const response = NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  let patch
  try {
    patch = parseSettingsPatch(payload)
  } catch (validationError) {
    if (validationError instanceof ZodError) {
      const response = NextResponse.json(
        { error: 'Invalid request body', details: validationError.issues },
        { status: 400 },
      )
      applySupabaseCookies(supabaseResponse, response)
      return response
    }
    const response = NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  try {
    await getOrCreateUserSettings(user.id, {
      email: user.email,
      fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      role: typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined,
    })
  } catch (settingsError) {
    console.error('Unable to ensure settings record', settingsError)
    const response = NextResponse.json({ error: 'Unable to update settings' }, { status: 500 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  let updated: SettingsView
  let section: string = 'preferences'

  try {
    switch (patch.type) {
      case 'profile':
        updated = await updateProfileSettings(user.id, patch.data)
        section = 'profile'
        break
      case 'apiKey':
        updated = await saveApiKey(user.id, patch.data)
        section = 'apiKey'
        break
      case 'apiKeyRevoke':
        updated = await revokeApiKey(user.id)
        section = 'apiKey'
        break
      case 'preferences':
        updated = await updatePreferenceSettings(user.id, patch.data)
        section = patch.data.theme ? 'theme' : 'preferences'
        break
      case 'theme':
        updated = await updateThemeSetting(user.id, patch.theme)
        section = 'theme'
        break
      default:
        const response = NextResponse.json({ error: 'Unsupported settings update' }, { status: 400 })
        applySupabaseCookies(supabaseResponse, response)
        return response
    }
  } catch (updateError) {
    console.error('Failed to update settings', updateError)
    const response = NextResponse.json({ error: 'Unable to update settings' }, { status: 500 })
    applySupabaseCookies(supabaseResponse, response)
    return response
  }

  await recordSettingsEvent(user.id, {
    section,
    theme: updated.theme,
    hasApiKey: updated.hasApiKey,
  })

  const response = NextResponse.json({ success: true, settings: updated })
  applySupabaseCookies(supabaseResponse, response)
  return response
}
