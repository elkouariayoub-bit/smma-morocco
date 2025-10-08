"use client"

import { createContext, useContext, useMemo, useState } from "react"
import type { ReactNode } from "react"

export type DateRange = { start: string; end: string; compare: boolean }

function iso(date: Date) {
  return date.toISOString().slice(0, 10)
}

function lastNDays(n: number): DateRange {
  const end = new Date()
  const start = new Date()
  start.setDate(end.getDate() - (n - 1))
  return { start: iso(start), end: iso(end), compare: false }
}

type DateRangeContextValue = {
  range: DateRange
  setRange: (next: DateRange) => void
}

const DateRangeCtx = createContext<DateRangeContextValue | undefined>(undefined)

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const [range, setRange] = useState<DateRange>(lastNDays(7))
  const value = useMemo(() => ({ range, setRange }), [range])

  return <DateRangeCtx.Provider value={value}>{children}</DateRangeCtx.Provider>
}

export function useDateRange() {
  const ctx = useContext(DateRangeCtx)
  if (!ctx) {
    throw new Error("useDateRange must be used within DateRangeProvider")
  }
  return ctx
}
