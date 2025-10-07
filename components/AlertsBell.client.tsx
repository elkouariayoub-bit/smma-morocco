"use client"

import { useEffect, useRef, useState } from "react"

import type { Alert } from "@/lib/alerts"

const POLL_INTERVAL_MS = 60_000
const ALERTS_ENDPOINT = "/api/alerts"
const DEFAULT_LIMIT = 20

type AlertsResponse = {
  alerts?: Alert[]
}

function isAlertArray(value: unknown): value is Alert[] {
  return Array.isArray(value) && value.every(isAlert)
}

function isAlert(value: unknown): value is Alert {
  if (!value || typeof value !== "object") {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.createdAt === "string" &&
    (candidate.severity === "high" || candidate.severity === "med")
  )
}

export default function AlertsBell() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let isActive = true

    const load = async () => {
      try {
        const url = new URL(ALERTS_ENDPOINT, window.location.origin)
        url.searchParams.set("limit", String(DEFAULT_LIMIT))

        const res = await fetch(url.toString(), { cache: "no-store" })

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`)
        }

        const json = (await res.json()) as AlertsResponse
        if (!isActive) return

        if (json && isAlertArray(json.alerts)) {
          setAlerts(json.alerts)
          setError(null)
        } else {
          setAlerts([])
          setError(null)
        }
      } catch (err) {
        if (!isActive) return
        console.error("Failed to load alerts", err)
        setError("Unable to load alerts")
      }
    }

    load()
    const intervalId = window.setInterval(load, POLL_INTERVAL_MS)

    return () => {
      isActive = false
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("click", handleClick)
    return () => document.removeEventListener("click", handleClick)
  }, [])

  const count = alerts.length
  const hasAlerts = count > 0

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={hasAlerts ? `View ${count} alerts` : "View alerts"}
      >
        <span role="img" aria-hidden>
          🔔
        </span>
        {hasAlerts && (
          <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1 text-xs font-semibold leading-5 text-white">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 dark:border-gray-700 dark:text-gray-100">
            Alerts
          </div>
          <ul className="max-h-80 divide-y divide-gray-200 overflow-auto dark:divide-gray-700">
            {error && (
              <li className="px-4 py-3 text-sm text-red-600 dark:text-red-400">{error}</li>
            )}
            {!error && alerts.map((alert) => (
              <li key={alert.id} className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <span className={alert.severity === "high" ? "font-medium text-red-600 dark:text-red-400" : "font-medium text-amber-600 dark:text-amber-400"}>
                    {alert.title}
                  </span>
                  <time className="text-xs text-gray-500 dark:text-gray-400" dateTime={alert.createdAt}>
                    {new Date(alert.createdAt).toLocaleString()}
                  </time>
                </div>
              </li>
            ))}
            {!error && alerts.length === 0 && (
              <li className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">No alerts</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
