"use client"

import { useContext } from "react"

import { SupabaseSessionContext } from "@/app/providers/supabase-session"

export function useSupabaseSession() {
  const context = useContext(SupabaseSessionContext)

  if (!context) {
    throw new Error("useSupabaseSession must be used within a SupabaseSessionProvider")
  }

  return context
}
