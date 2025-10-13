import type { NextRequest } from "next/server"

import { handleSupabaseOAuthCallback } from "@/lib/supabase-auth-callback"

export async function GET(request: NextRequest) {
  return handleSupabaseOAuthCallback(request)
}
