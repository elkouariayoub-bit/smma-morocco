import { NextRequest, NextResponse } from "next/server"

import { applySupabaseCookies, createClient } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  const supabaseResponse = NextResponse.next()

  try {
    const supabase = createClient({ request, response: supabaseResponse })
    const { error } = await supabase.auth.signOut()

    if (error) {
      const errorResponse = NextResponse.json({ success: false, error: error.message }, { status: 400 })
      applySupabaseCookies(supabaseResponse, errorResponse)
      return errorResponse
    }

    const successResponse = NextResponse.json({ success: true })
    applySupabaseCookies(supabaseResponse, successResponse)
    return successResponse
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign out."
    console.error("Supabase sign-out failed", error)
    const errorResponse = NextResponse.json({ success: false, error: message }, { status: 500 })
    applySupabaseCookies(supabaseResponse, errorResponse)
    return errorResponse
  }
}
