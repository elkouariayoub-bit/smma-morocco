import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
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

  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Unable to verify Supabase session for settings request', error)
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  const user = session?.user
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await getOrCreateUserSettings(user.id, {
      email: user.email,
      fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      role: typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined,
    })

    return NextResponse.json({ settings })
  } catch (settingsError) {
    console.error('Failed to load user settings', settingsError)
    return NextResponse.json({ error: 'Unable to load settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  loadServerEnv()

  const rateLimited = applyRateLimit(request, 'patch')
  if (rateLimited) {
    return rateLimited
  }

  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('Unable to verify Supabase session for settings update', error)
    return NextResponse.json({ error: 'Failed to verify authentication' }, { status: 500 })
  }

  const user = session?.user
  if (!user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })
  }

  let patch
  try {
    patch = parseSettingsPatch(payload)
  } catch (validationError) {
    if (validationError instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validationError.issues },
        { status: 400 },
      )
    }
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  try {
    await getOrCreateUserSettings(user.id, {
      email: user.email,
      fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      role: typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined,
    })
  } catch (settingsError) {
    console.error('Unable to ensure settings record', settingsError)
    return NextResponse.json({ error: 'Unable to update settings' }, { status: 500 })
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
        return NextResponse.json({ error: 'Unsupported settings update' }, { status: 400 })
    }
  } catch (updateError) {
    console.error('Failed to update settings', updateError)
    return NextResponse.json({ error: 'Unable to update settings' }, { status: 500 })
  }

  await recordSettingsEvent(user.id, {
    section,
    theme: updated.theme,
    hasApiKey: updated.hasApiKey,
  })

  return NextResponse.json({ success: true, settings: updated })
}
