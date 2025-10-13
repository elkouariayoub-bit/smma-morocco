import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"
import {
  createBrowserClient,
  createServerClient,
  type CookieOptions,
} from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// TODO: Replace with generated Supabase types when available.
type Database = any

type SupabaseConfig = {
  url: string
  anonKey: string
}

type CreateClientOptions = {
  request?: NextRequest
  response?: NextResponse
}

type CookieAdapter = {
  get: (name: string) => string | undefined
  set: (name: string, value: string, options?: CookieOptions) => void
  remove: (name: string, options?: CookieOptions) => void
}

const BASE_COOKIE_OPTIONS: CookieOptions = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
}

function resolveConfig(context: "server" | "client"): SupabaseConfig {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    const message =
      "Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."

    if (context === "client") {
      throw new Error(`${message} (client runtime)`)
    }

    throw new Error(`${message} (server runtime)`)
  }

  return { url, anonKey }
}

function mergeCookieOptions(options?: CookieOptions): CookieOptions {
  return {
    ...BASE_COOKIE_OPTIONS,
    ...options,
  }
}

function createRouteCookieAdapter(request: NextRequest, response: NextResponse): CookieAdapter {
  return {
    get(name: string) {
      return request.cookies.get(name)?.value
    },
    set(name: string, value: string, options?: CookieOptions) {
      response.cookies.set({
        name,
        value,
        ...mergeCookieOptions(options),
      })
    },
    remove(name: string, options?: CookieOptions) {
      response.cookies.set({
        name,
        value: "",
        ...mergeCookieOptions({ ...options, maxAge: 0 }),
      })
    },
  }
}

function createServerCookieAdapter(): CookieAdapter {
  const cookieStore = cookies()

  return {
    get(name: string) {
      return cookieStore.get(name)?.value
    },
    set(name: string, value: string, options?: CookieOptions) {
      cookieStore.set({
        name,
        value,
        ...mergeCookieOptions(options),
      })
    },
    remove(name: string, options?: CookieOptions) {
      cookieStore.set({
        name,
        value: "",
        ...mergeCookieOptions({ ...options, maxAge: 0 }),
      })
    },
  }
}

export function createClient(options: CreateClientOptions = {}): SupabaseClient<Database> {
  const { request, response } = options
  const { url, anonKey } = resolveConfig("server")
  const cookieAdapter =
    request && response ? createRouteCookieAdapter(request, response) : createServerCookieAdapter()

  return createServerClient<Database>(url, anonKey, {
    cookies: () => cookieAdapter,
  })
}

let browserClient: SupabaseClient<Database> | null = null

export function supabaseBrowser(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("supabaseBrowser must only be called in a browser environment.")
  }

  if (!browserClient) {
    const { url, anonKey } = resolveConfig("client")
    browserClient = createBrowserClient<Database>(url, anonKey)
  }

  return browserClient
}

export function getOptionalSupabaseBrowserClient(): SupabaseClient<Database> | null {
  try {
    return supabaseBrowser()
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Supabase browser client unavailable:", error)
    }

    return null
  }
}

type CookieRecord = ReturnType<NextResponse["cookies"]["getAll"]>[number]

function toResponseCookie(cookie: CookieRecord) {
  const { name, value, ...rest } = cookie
  return {
    name,
    value,
    ...rest,
  }
}

export function applySupabaseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(toResponseCookie(cookie))
  })
}
