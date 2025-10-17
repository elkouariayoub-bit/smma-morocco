"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type CalendarRange = {
  from?: Date
  to?: Date
}

type CalendarProps = {
  mode?: "single" | "range"
  numberOfMonths?: number
  captionLayout?: "buttons" | "dropdown"
  selected?: CalendarRange
  onSelect?: (value: CalendarRange | undefined) => void
  className?: string
  toDate?: Date
  defaultMonth?: Date
}

function toISO(date?: Date) {
  return date ? date.toISOString().slice(0, 10) : ""
}

function fromISO(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

export function Calendar({ mode = "range", selected, onSelect, className, toDate }: CalendarProps) {
  const startValue = toISO(selected?.from)
  const endValue = toISO(selected?.to ?? selected?.from)
  const [from, setFrom] = React.useState<string>(startValue)
  const [to, setTo] = React.useState<string>(endValue)

  React.useEffect(() => {
    setFrom(startValue)
    setTo(endValue)
  }, [startValue, endValue])

  const handleChange = React.useCallback(
    (nextFrom: string, nextTo: string) => {
      if (mode === "single") {
        const date = fromISO(nextFrom)
        setFrom(nextFrom)
        setTo(nextFrom)
        onSelect?.({ from: date, to: date })
        return
      }

      const range: CalendarRange = {
        from: fromISO(nextFrom),
        to: fromISO(nextTo || nextFrom),
      }

      setFrom(nextFrom)
      setTo(nextTo)
      if (range.from && range.to) {
        if (range.from > range.to) {
          onSelect?.({ from: range.to, to: range.from })
        } else {
          onSelect?.(range)
        }
      }
    },
    [mode, onSelect]
  )

  return (
    <div className={cn("flex flex-col gap-3 text-sm", className)}>
      <div className="grid gap-1">
        <span className="font-medium text-foreground">Start date</span>
        <input
          type="date"
          value={from}
          max={toDate ? toISO(toDate) : undefined}
          onChange={(event) => {
            const value = event.target.value
            handleChange(value, to || value)
          }}
          className="rounded-md border px-3 py-2"
        />
      </div>
      <div className="grid gap-1">
        <span className="font-medium text-foreground">End date</span>
        <input
          type="date"
          value={to}
          min={from || undefined}
          max={toDate ? toISO(toDate) : undefined}
          onChange={(event) => {
            const value = event.target.value
            handleChange(from || value, value)
          }}
          className="rounded-md border px-3 py-2"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Select a start and end date to filter dashboard metrics.
      </p>
    </div>
  )
}
