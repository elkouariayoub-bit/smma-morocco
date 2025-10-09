"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useDateRange } from "@/app/providers/date-range"

function iso(d?: Date) {
  return d ? d.toISOString().slice(0, 10) : ""
}

function fromISO(s?: string) {
  return s ? new Date(s + "T00:00:00") : undefined
}

function label(d?: Date) {
  return d
    ? d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : ""
}

export default function DateRangePicker() {
  const { range, setRange } = useDateRange()
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo(
    () => ({
      from: fromISO(range.start),
      to: fromISO(range.end),
    }),
    [range.start, range.end]
  )

  const contentProps = {
    onPointerDownOutside: (event: { target?: EventTarget | null; preventDefault: () => void }) => {
      const target = event?.target as HTMLElement | undefined
      if (target?.closest?.(".rdp")) {
        event.preventDefault()
      }
    },
    onInteractOutside: (event: { target?: EventTarget | null; preventDefault: () => void }) => {
      const target = event?.target as HTMLElement | undefined
      if (target?.closest?.(".rdp")) {
        event.preventDefault()
      }
    },
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[280px] justify-between">
          <span>
            {selected.from ? label(selected.from) : "Start"} — {selected.to ? label(selected.to) : "End"}
          </span>
          <span className="ml-2 opacity-60">▾</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="p-2" {...contentProps}>
        <Calendar
          mode="range"
          numberOfMonths={2}
          captionLayout="dropdown"
          selected={selected}
          onSelect={(value) => {
            if (!value) {
              return
            }

            let nextRange: { from?: Date; to?: Date } | undefined

            if (value instanceof Date) {
              nextRange = { from: value, to: value }
            } else if (typeof value === "object" && "from" in value) {
              nextRange = value as { from?: Date; to?: Date }
            }

            if (!nextRange?.from) {
              return
            }

            const end = nextRange.to ?? nextRange.from
            setRange({ start: iso(nextRange.from), end: iso(end), compare: range.compare })
          }}
          className="rounded-md border shadow-sm"
        />
      </PopoverContent>
    </Popover>
  )
}
