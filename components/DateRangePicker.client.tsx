"use client"

import * as React from "react"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { useDateRange } from "@/app/providers/date-range"

function toISO(d?: Date) {
  return d ? d.toISOString().slice(0, 10) : ""
}

function fromISO(s?: string) {
  return s ? new Date(s + "T00:00:00") : undefined
}

function pretty(d?: Date) {
  return d ? d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : ""
}

export default function DateRangePicker() {
  const { range, setRange } = useDateRange()
  const [open, setOpen] = React.useState(false)

  const selected = React.useMemo(() => ({ from: fromISO(range.start), to: fromISO(range.end) }), [range])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="min-w-[260px] justify-between">
          <span>{selected.from ? pretty(selected.from) : "Start"} — {selected.to ? pretty(selected.to) : "End"}</span>
          <span className="ml-2 opacity-60">▾</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="p-2">
        <Calendar
          mode="range"
          numberOfMonths={2}
          selected={selected}
          onSelect={(v) => {
            if (!v?.from) return
            const end = v.to ?? v.from
            setRange({ start: toISO(v.from), end: toISO(end), compare: range.compare })
          }}
          captionLayout="dropdown"
          className="rounded-md border shadow-sm"
        />
      </PopoverContent>
    </Popover>
  )
}
