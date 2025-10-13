import { NextRequest, NextResponse } from "next/server"

import { sanitizeRedirectPath } from "@/lib/auth"
import { loadServerEnv } from "@/lib/load-server-env"
import { applySupabaseCookies, createClient } from "@/lib/supabase"

interface SignInPayload {
  email?: string
  password?: string
  next?: string
}

const normalizeEmail = (value: string) => value.trim().toLowerCase()

export async function POST(request: NextRequest) {
  let payload: SignInPayload

  try {
    payload = (await request.json()) as SignInPayload
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const email = typeof payload.email === "string" ? normalizeEmail(payload.email) : ""
  const password = typeof payload.password === "string" ? payload.password : ""

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
  }

  loadServerEnv()
  const { env } = await import("@/lib/env")

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 })
  }

  const supabaseResponse = NextResponse.next()
  const supabase = createClient({ request, response: supabaseResponse })

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      const errorResponse = NextResponse.json({ error: error.message || "Invalid credentials" }, { status: 401 })
      applySupabaseCookies(supabaseResponse, errorResponse)
      return errorResponse
    }

    if (!data?.user?.id) {
      const errorResponse = NextResponse.json({ error: "Unable to complete sign-in" }, { status: 500 })
      applySupabaseCookies(supabaseResponse, errorResponse)
      return errorResponse
    }

    const safeNext = sanitizeRedirectPath(payload.next)

    const successResponse = NextResponse.json({
      user: { id: data.user.id },
      redirectTo: safeNext ?? "/dashboard",
    })
    applySupabaseCookies(supabaseResponse, successResponse)
    return successResponse
  } catch (error) {
    console.error("Supabase sign-in failed", error)
    const errorResponse = NextResponse.json({ error: "Unexpected authentication error" }, { status: 500 })
    applySupabaseCookies(supabaseResponse, errorResponse)
    return errorResponse
  }
}
