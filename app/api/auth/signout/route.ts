import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase"

export async function POST() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign out."
    console.error("Supabase sign-out failed", error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
