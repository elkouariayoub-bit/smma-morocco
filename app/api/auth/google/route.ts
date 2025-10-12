import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

import { sanitizeRedirectPath } from "@/lib/auth"
import { loadServerEnv } from "@/lib/load-server-env"

const buildLoginRedirect = (origin: string, message: string, next?: string | null) => {
  const fallback = new URL("/auth/login", origin)
  fallback.searchParams.set("message", message)
  if (next) {
    fallback.searchParams.set("next", next)
  }
  return fallback.toString()
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  loadServerEnv()
  const { env } = await import("@/lib/env")

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.redirect(
      buildLoginRedirect(url.origin, "Authentication is currently unavailable.")
    )
  }

  const supabase = createRouteHandlerClient({ cookies })
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
      return NextResponse.redirect(buildLoginRedirect(url.origin, message, safeNext))
    }

    return NextResponse.redirect(data.url)
  } catch (error) {
    console.error("Failed to initialize Google OAuth", error)
    return NextResponse.redirect(
      buildLoginRedirect(url.origin, "Unexpected error starting Google sign-in.", safeNext)
    )
  }
}
