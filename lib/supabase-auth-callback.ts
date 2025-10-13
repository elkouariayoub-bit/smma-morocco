import { NextRequest, NextResponse } from "next/server"

import { sanitizeRedirectPath } from "@/lib/auth"
import { applySupabaseCookies, createClient } from "@/lib/supabase"

const DEFAULT_SUCCESS_PATH = "/clients"
const LOGIN_PATH = "/auth/login"
const RESET_PATH = "/auth/reset"

function buildLoginRedirect(origin: string, message: string, next: string | null) {
  const loginUrl = new URL(LOGIN_PATH, origin)
  loginUrl.searchParams.set("message", message)

  if (next) {
    loginUrl.searchParams.set("next", next)
  }

  return loginUrl
}

function buildSuccessRedirect(origin: string, next: string | null) {
  const target = new URL(next ?? DEFAULT_SUCCESS_PATH, origin)
  return target
}

function buildResetRedirect(origin: string) {
  return new URL(RESET_PATH, origin)
}

export async function handleSupabaseOAuthCallback(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const error = url.searchParams.get("error")
  const errorDescription = url.searchParams.get("error_description")
  const type = url.searchParams.get("type")
  const nextParam = sanitizeRedirectPath(url.searchParams.get("next"))

  if (error) {
    const redirectResponse = NextResponse.redirect(
      buildLoginRedirect(url.origin, errorDescription ?? "Sign-in failed. Please try again.", nextParam),
      { status: 303 },
    )
    return redirectResponse
  }

  if (!code) {
    const redirectResponse = NextResponse.redirect(
      buildLoginRedirect(url.origin, "No authorization code was provided.", nextParam),
      { status: 303 },
    )
    return redirectResponse
  }

  const successRedirect = buildSuccessRedirect(url.origin, nextParam)
  const successResponse = NextResponse.redirect(successRedirect, { status: 303 })

  try {
    const supabase = createClient({ request, response: successResponse })
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      const redirectResponse = NextResponse.redirect(
        buildLoginRedirect(
          url.origin,
          exchangeError.message || "Unable to complete Google sign-in.",
          nextParam,
        ),
        { status: 303 },
      )
      applySupabaseCookies(successResponse, redirectResponse)
      return redirectResponse
    }

    if (!data.session) {
      const redirectResponse = NextResponse.redirect(
        buildLoginRedirect(
          url.origin,
          "Authentication succeeded but no session was returned.",
          nextParam,
        ),
        { status: 303 },
      )
      applySupabaseCookies(successResponse, redirectResponse)
      return redirectResponse
    }

    if (type === "recovery") {
      const resetResponse = NextResponse.redirect(buildResetRedirect(url.origin), { status: 303 })
      applySupabaseCookies(successResponse, resetResponse)
      return resetResponse
    }

    return successResponse
  } catch (err) {
    console.error("Unexpected Supabase OAuth callback error", err)
    const redirectResponse = NextResponse.redirect(
      buildLoginRedirect(url.origin, "Unexpected authentication error. Please try again.", nextParam),
      { status: 303 },
    )
    applySupabaseCookies(successResponse, redirectResponse)
    return redirectResponse
  }
}
