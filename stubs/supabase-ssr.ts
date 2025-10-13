import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type CookieOptions = {
  domain?: string
  expires?: Date
  httpOnly?: boolean
  maxAge?: number
  path?: string
  sameSite?: 'lax' | 'strict' | 'none'
  secure?: boolean
}

export type CookieMethods = {
  get: (name: string) => string | undefined
  set: (name: string, value: string, options?: CookieOptions) => void
  remove: (name: string, options?: CookieOptions) => void
}

export function createServerClient<Database = Record<string, unknown>>(
  supabaseUrl: string,
  supabaseKey: string,
  { cookies }: { cookies: () => CookieMethods }
): SupabaseClient<Database> {
  const cookieAdapter = cookies()
  const baseOptions: CookieOptions = {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      storageKey: 'sb-auth-token',
      storage: {
        getItem(key) {
          return cookieAdapter.get(key) ?? null
        },
        setItem(key, value) {
          cookieAdapter.set(key, value, baseOptions)
        },
        removeItem(key) {
          cookieAdapter.remove(key, { ...baseOptions, maxAge: 0 })
        },
      },
    },
  })
}

export function createBrowserClient<Database = Record<string, unknown>>(
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
}
