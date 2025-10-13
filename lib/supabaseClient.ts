import { cookies } from "next/headers"
import type { NextRequest, NextResponse } from "next/server"
import {
  createClientComponentClient,
  createRouteHandlerClient,
  createServerComponentClient,
} from "@supabase/auth-helpers-nextjs"
import type { CookieOptions } from "@supabase/auth-helpers-shared"
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

type ExtendedCookieOptions = CookieOptions & {
  maxAge?: number
  httpOnly?: boolean
}

const baseCookieOptions: CookieOptions = {
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  domain: undefined,
}

const responseCookieOptions: ExtendedCookieOptions = {
  ...baseCookieOptions,
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 365 * 1_000,
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

function mergeCookieOptions(options?: Partial<ExtendedCookieOptions>): ExtendedCookieOptions {
  return {
    ...responseCookieOptions,
    ...options,
  }
}

function createRouteCookieStore(request: NextRequest, response: NextResponse) {
  const requestCookies = request.cookies

  return {
    get: requestCookies.get.bind(requestCookies),
    getAll: requestCookies.getAll.bind(requestCookies),
    has: requestCookies.has.bind(requestCookies),
    set(name: string, value: string, options?: ExtendedCookieOptions) {
      response.cookies.set({
        name,
        value,
        ...mergeCookieOptions(options),
      })
    },
    delete(name: string) {
      response.cookies.set({
        name,
        value: "",
        ...mergeCookieOptions({ maxAge: 0 }),
      })
    },
    [Symbol.iterator]: requestCookies[Symbol.iterator].bind(requestCookies),
  } as unknown as ReturnType<typeof cookies>
}

export function createClient(options: CreateClientOptions = {}): SupabaseClient<Database> {
  const { request, response } = options
  const { url, anonKey } = resolveConfig("server")

  if (request && response) {
    return createRouteHandlerClient<Database>(
      {
        cookies: () => createRouteCookieStore(request, response),
      },
      {
        supabaseUrl: url,
        supabaseKey: anonKey,
        cookieOptions: baseCookieOptions,
      },
    )
  }

  return createServerComponentClient<Database>(
    { cookies },
    {
      supabaseUrl: url,
      supabaseKey: anonKey,
      cookieOptions: baseCookieOptions,
    },
  )
}

let browserClient: SupabaseClient<Database> | null = null

export function supabaseBrowser(): SupabaseClient<Database> {
  if (typeof window === "undefined") {
    throw new Error("supabaseBrowser must only be called in a browser environment.")
  }

  if (!browserClient) {
    const { url, anonKey } = resolveConfig("client")
    browserClient = createClientComponentClient<Database>({
      supabaseUrl: url,
      supabaseKey: anonKey,
    })
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
