"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDateRange } from "@/app/providers/date-range"
import { cn } from "@/lib/utils"

function toISO(date?: Date) {
  return date ? date.toISOString().slice(0, 10) : ""
}

function fromISO(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined
}

function prettyDate(date?: Date) {
  return date
    ? date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
    : ""
}

export default function DateRangePicker({ className }: { className?: string }) {
  const { range, setRange } = useDateRange()
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo(
    () => ({
      from: fromISO(range.start),
      to: fromISO(range.end),
    }),
    [range.start, range.end]
  )

  const handleSelect = React.useCallback(
    (value: { from?: Date; to?: Date } | undefined) => {
      if (!value) return
      const startISO = toISO(value.from)
      const endISO = toISO(value.to ?? value.from)
      if (startISO && endISO) {
        setRange({ start: startISO, end: endISO, compare: range.compare })
        setOpen(false)
      }
    },
    [range.compare, setRange, setOpen]
  )

  const handleToday = React.useCallback(() => {
    const todayISO = toISO(new Date())
    setRange({ start: todayISO, end: todayISO, compare: range.compare })
    setOpen(false)
  }, [range.compare, setRange, setOpen])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="min-w-[260px] justify-between">
            <span className="truncate">
              {selected.from ? prettyDate(selected.from) : "Start"} — {selected.to ? prettyDate(selected.to) : "End"}
            </span>
            <span className="ml-2 opacity-60" aria-hidden>
              ▾
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="p-2">
          <Calendar
            mode="range"
            numberOfMonths={2}
            captionLayout="dropdown"
            selected={selected}
            onSelect={handleSelect}
            className="rounded-md border bg-background p-3 shadow-sm"
          />
          <div className="mt-2 flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
            <Button variant="secondary" size="sm" onClick={handleToday}>
              Today
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
