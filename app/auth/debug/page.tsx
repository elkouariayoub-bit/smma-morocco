import dynamic from "next/dynamic"
import { notFound } from "next/navigation"
import type { Session } from "@supabase/supabase-js"
import { useCallback, useEffect, useMemo, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

type JwtClaims = Record<string, unknown>

type ActionState = "idle" | "refresh" | "signout"

function decodeJwtClaims(token?: string | null): JwtClaims | null {
  if (!token) {
    return null
  }

  try {
    const payload = token.split(".")[1]

    if (!payload) {
      return null
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decodedString = decodeURIComponent(
      Array.from(atob(normalized))
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join("")
    )

    return JSON.parse(decodedString) as JwtClaims
  } catch (error) {
    console.warn("Unable to decode JWT claims", error)
    return null
  }
}

function DebugClient(): JSX.Element {
  const supabase = useMemo(() => createClientComponentClient(), [])
  const [session, setSession] = useState<Session | null>(null)
  const [claims, setClaims] = useState<JwtClaims | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionState, setActionState] = useState<ActionState>("idle")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const syncSession = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        throw sessionError
      }

      setSession(data.session)
      setClaims(decodeJwtClaims(data.session?.access_token))
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Failed to fetch session")
      setSession(null)
      setClaims(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    void syncSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setClaims(decodeJwtClaims(nextSession?.access_token))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, syncSession])

  const handleRefresh = useCallback(async () => {
    setActionState("refresh")
    setError(null)
    setMessage(null)

    try {
      const { data, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        throw refreshError
      }

      setSession(data.session)
      setClaims(decodeJwtClaims(data.session?.access_token))
      setMessage("Session refreshed successfully")
    } catch (refreshException) {
      setError(
        refreshException instanceof Error
          ? refreshException.message
          : "Unable to refresh session"
      )
    } finally {
      setActionState("idle")
    }
  }, [supabase])

  const handleSignOut = useCallback(async () => {
    setActionState("signout")
    setError(null)
    setMessage(null)

    try {
      const { error: signOutError } = await supabase.auth.signOut()

      if (signOutError) {
        throw signOutError
      }

      setSession(null)
      setClaims(null)
      setMessage("Signed out successfully")
    } catch (signOutException) {
      setError(
        signOutException instanceof Error ? signOutException.message : "Unable to sign out"
      )
    } finally {
      setActionState("idle")
    }
  }, [supabase])

  const provider = session?.user?.app_metadata?.provider ?? "unknown"
  const email = session?.user?.email ?? "Not signed in"
  const expiresAt = session?.expires_at
    ? new Date(session.expires_at * 1000).toLocaleString()
    : "N/A"
  const isActionLoading = actionState !== "idle"

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-white">Supabase Auth Debug</h1>
        <p className="text-sm text-zinc-400">
          Inspect the current authentication session. This route is only available in development.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void syncSession()}
          className="rounded-md bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-100 shadow-sm transition hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
          disabled={isLoading}
        >
          {isLoading ? "Refreshing..." : "Reload session"}
        </button>
        <button
          type="button"
          onClick={() => void handleRefresh()}
          className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 disabled:opacity-60"
          disabled={isActionLoading}
        >
          {actionState === "refresh" ? "Refreshing token..." : "Refresh token"}
        </button>
        <button
          type="button"
          onClick={() => void handleSignOut()}
          className="rounded-md border border-red-500 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-60"
          disabled={isActionLoading}
        >
          {actionState === "signout" ? "Signing out..." : "Sign out"}
        </button>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Email</p>
          <p className="mt-2 text-sm text-zinc-100">{email}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Provider</p>
          <p className="mt-2 text-sm text-zinc-100">{provider}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Expires</p>
          <p className="mt-2 text-sm text-zinc-100">{expiresAt}</p>
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-semibold text-white">Session</h2>
        <p className="mt-1 text-xs text-zinc-500">
          {session ? "The raw Supabase session object." : "No active session detected."}
        </p>
        <pre className="mt-3 max-h-80 overflow-auto rounded bg-black/40 p-3 text-xs text-zinc-200">
          {JSON.stringify(session, null, 2)}
        </pre>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="text-sm font-semibold text-white">JWT Claims</h2>
        <p className="mt-1 text-xs text-zinc-500">
          {claims ? "Decoded access token claims." : "Refresh the session to decode the access token."}
        </p>
        <pre className="mt-3 max-h-80 overflow-auto rounded bg-black/40 p-3 text-xs text-zinc-200">
          {claims ? JSON.stringify(claims, null, 2) : "{}"}
        </pre>
      </section>
    </div>
  )
}

const AuthDebugClient = dynamic(async () => ({ default: DebugClient }), { ssr: false })

export default function AuthDebugPage(): JSX.Element {
  if (process.env.NODE_ENV !== "development") {
    notFound()
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-10 text-zinc-100">
      <div className="mx-auto w-full max-w-4xl">
        <AuthDebugClient />
      </div>
    </main>
  )
}
