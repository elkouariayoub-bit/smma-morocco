import { NextRequest, NextResponse } from "next/server"

import { sanitizeRedirectPath } from "@/lib/auth"
import { applySupabaseCookies, createClient } from "@/lib/supabase"

function buildLoginRedirect(origin: string, message: string, next?: string | null) {
  const url = new URL("/auth/login", origin)
  url.searchParams.set("message", message)

  if (next) {
    url.searchParams.set("next", next)
  }

  return url
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const errorDescription = requestUrl.searchParams.get("error_description")
  const nextParam = sanitizeRedirectPath(requestUrl.searchParams.get("next"))
  const type = requestUrl.searchParams.get("type")

  if (error) {
    const loginRedirect = buildLoginRedirect(
      requestUrl.origin,
      errorDescription || "Sign-in failed. Please try again.",
      nextParam,
    )

    return NextResponse.redirect(loginRedirect)
  }

  if (!code) {
    const loginRedirect = buildLoginRedirect(
      requestUrl.origin,
      "No authorization code was provided.",
      nextParam,
    )

    return NextResponse.redirect(loginRedirect)
  }

  const successRedirect = new URL(nextParam ?? "/dashboard", requestUrl.origin)
  const authResponse = NextResponse.redirect(successRedirect)

  try {
    const supabase = createClient({ request, response: authResponse })
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      const loginRedirect = buildLoginRedirect(
        requestUrl.origin,
        exchangeError.message || "Unable to complete Google sign-in.",
        nextParam,
      )
      const redirectResponse = NextResponse.redirect(loginRedirect)
      applySupabaseCookies(authResponse, redirectResponse)
      return redirectResponse
    }

    if (type === "recovery") {
      const resetRedirect = new URL("/auth/reset", requestUrl.origin)
      const resetResponse = NextResponse.redirect(resetRedirect)
      applySupabaseCookies(authResponse, resetResponse)
      return resetResponse
    }

    return authResponse
  } catch (err) {
    console.error("Unexpected Supabase OAuth callback error", err)
    const loginRedirect = buildLoginRedirect(
      requestUrl.origin,
      "Unexpected authentication error. Please try again.",
      nextParam,
    )
    const redirectResponse = NextResponse.redirect(loginRedirect)
    applySupabaseCookies(authResponse, redirectResponse)
    return redirectResponse
  }
}
