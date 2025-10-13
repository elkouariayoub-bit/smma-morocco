"use client"

import { useMemo } from "react"

import { useSupabaseSession } from "./useSupabaseSession"

export function useUser() {
  const { session, user, isLoading, refresh } = useSupabaseSession()

  return useMemo(
    () => ({
      session,
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      refresh,
    }),
    [isLoading, refresh, session, user],
  )
}
