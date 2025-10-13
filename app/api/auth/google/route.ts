import { NextRequest, NextResponse } from "next/server"

import { sanitizeRedirectPath } from "@/lib/auth"
import { loadServerEnv } from "@/lib/load-server-env"
import { applySupabaseCookies, createClient } from "@/lib/supabase"

const buildLoginRedirect = (origin: string, message: string, next?: string | null) => {
  const fallback = new URL("/auth/login", origin)
  fallback.searchParams.set("message", message)
  if (next) {
    fallback.searchParams.set("next", next)
  }
  return fallback.toString()
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  loadServerEnv()
  const { env } = await import("@/lib/env")

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.redirect(
      buildLoginRedirect(url.origin, "Authentication is currently unavailable.")
    )
  }

  const supabaseResponse = NextResponse.next()
  const supabase = createClient({ request, response: supabaseResponse })
  const safeNext = sanitizeRedirectPath(url.searchParams.get("next") ?? undefined)
  const redirectTarget = new URL("/auth/callback", url.origin)
  if (safeNext) {
    redirectTarget.searchParams.set("next", safeNext)
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTarget.toString(),
        skipBrowserRedirect: true,
      },
    })

    if (error || !data?.url) {
      const message = error?.message ?? "Unable to start Google sign-in. Please try again."
      const redirectResponse = NextResponse.redirect(buildLoginRedirect(url.origin, message, safeNext))
      applySupabaseCookies(supabaseResponse, redirectResponse)
      return redirectResponse
    }

    const redirectResponse = NextResponse.redirect(data.url)
    applySupabaseCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  } catch (error) {
    console.error("Failed to initialize Google OAuth", error)
    const redirectResponse = NextResponse.redirect(
      buildLoginRedirect(url.origin, "Unexpected error starting Google sign-in.", safeNext)
    )
    applySupabaseCookies(supabaseResponse, redirectResponse)
    return redirectResponse
  }
}
