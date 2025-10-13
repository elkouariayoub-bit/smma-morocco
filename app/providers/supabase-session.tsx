"use client"

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react"
import type { Session } from "@supabase/supabase-js"

import { supabaseBrowser } from "@/lib/supabase"

export type SupabaseSessionContextValue = {
  session: Session | null
  user: Session["user"] | null
  isLoading: boolean
  refresh: () => Promise<Session | null>
}

export const SupabaseSessionContext = createContext<SupabaseSessionContextValue | undefined>(undefined)

function getClient(
  existing: MutableRefObject<ReturnType<typeof supabaseBrowser> | null>,
): ReturnType<typeof supabaseBrowser> | null {
  if (existing.current) {
    return existing.current
  }

  try {
    existing.current = supabaseBrowser()
    return existing.current
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Supabase client is unavailable in the browser:", error)
    }

    return null
  }
}

export function SupabaseSessionProvider({
  initialSession,
  children,
}: {
  initialSession: Session | null
  children: ReactNode
}) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isLoading, setIsLoading] = useState<boolean>(!initialSession)
  const clientRef = useRef<ReturnType<typeof supabaseBrowser> | null>(null)

  const refresh = useCallback(async () => {
    const supabase = getClient(clientRef)

    if (!supabase) {
      setSession(null)
      return null
    }

    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        throw error
      }

      const nextSession = data.session ?? null
      setSession(nextSession)
      return nextSession
    } catch (error) {
      console.error("Failed to refresh Supabase session", error)
      setSession(null)
      return null
    }
  }, [])

  useEffect(() => {
    const supabase = getClient(clientRef)

    if (!supabase) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const syncInitialSession = async () => {
      if (initialSession) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        console.error("Failed to resolve initial Supabase session", error)
        setSession(null)
      } else {
        setSession(data.session ?? null)
      }

      setIsLoading(false)
    }

    syncInitialSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setIsLoading(false)
    })

    return () => {
      isMounted = false
      listener?.subscription.unsubscribe()
    }
  }, [initialSession])

  const value = useMemo<SupabaseSessionContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      refresh,
    }),
    [isLoading, refresh, session],
  )

  return (
    <SupabaseSessionContext.Provider value={value}>{children}</SupabaseSessionContext.Provider>
  )
}
