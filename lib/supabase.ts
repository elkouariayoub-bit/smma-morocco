import { cookies } from 'next/headers'
import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// TODO: Replace with generated types from Supabase if available.
// Using `any` keeps the client flexible until a generated schema is provided.
type Database = any

type SupabaseConfig = {
  url: string
  anonKey: string
}

function resolveConfig(context: 'server' | 'client'): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      `Supabase environment variables are missing for the ${context} runtime. ` +
        'Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.',
    )
  }

  return { url, anonKey }
}

const defaultCookieOptions: CookieOptions = {
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  httpOnly: true,
}

export function createClient(): SupabaseClient<Database> {
  const { url, anonKey } = resolveConfig('server')
  const cookieStore = cookies()
  type CookieStore = typeof cookieStore
  type ResponseCookie = Parameters<CookieStore['set']>[0]

  return createServerClient<Database>(url, anonKey, {
    cookies: () => ({
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: CookieOptions) {
        const cookie = {
          name,
          value,
          ...defaultCookieOptions,
          ...options,
        } satisfies ResponseCookie

        cookieStore.set(cookie)
      },
      remove(name: string, options?: CookieOptions) {
        const cookie = {
          name,
          value: '',
          ...defaultCookieOptions,
          ...options,
          maxAge: 0,
        } satisfies ResponseCookie

        cookieStore.set(cookie)
      },
    }),
  })
}

let browserClient: SupabaseClient<Database> | null = null

export function supabaseBrowser(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    throw new Error('supabaseBrowser is only available in browser environments.')
  }

  if (!browserClient) {
    const { url, anonKey } = resolveConfig('client')
    browserClient = createBrowserClient<Database>(url, anonKey)
  }

  return browserClient
}

export function getOptionalSupabaseBrowserClient(): SupabaseClient<Database> | null {
  try {
    return supabaseBrowser()
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Supabase browser client unavailable:', error)
    }

    return null
  }
}
