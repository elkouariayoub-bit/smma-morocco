import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

import { sanitizeRedirectPath } from "@/lib/auth"
import { loadServerEnv } from "@/lib/load-server-env"

interface SignInPayload {
  email?: string
  password?: string
  next?: string
}

const normalizeEmail = (value: string) => value.trim().toLowerCase()

export async function POST(request: Request) {
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

  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message || "Invalid credentials" }, { status: 401 })
    }

    if (!data?.user?.id) {
      return NextResponse.json({ error: "Unable to complete sign-in" }, { status: 500 })
    }

    const safeNext = sanitizeRedirectPath(payload.next)

    return NextResponse.json({
      user: { id: data.user.id },
      redirectTo: safeNext ?? "/dashboard",
    })
  } catch (error) {
    console.error("Supabase sign-in failed", error)
    return NextResponse.json({ error: "Unexpected authentication error" }, { status: 500 })
  }
}
