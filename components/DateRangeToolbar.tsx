"use client"

import * as React from "react"

import DateRangePicker from "@/components/DateRangePicker.client"
import { useDateRange } from "@/app/providers/date-range"
import { Button } from "@/components/ui/button"

export default function DateRangeToolbar() {
  const { setRange, range } = useDateRange()

  const setPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (days - 1))
    const iso = (date: Date) => date.toISOString().slice(0, 10)
    setRange({ start: iso(start), end: iso(end), compare: range.compare })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 overflow-visible">
      <DateRangePicker />
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => setPreset(7)}>
          Last 7d
        </Button>
        <Button variant="outline" onClick={() => setPreset(30)}>
          Last 30d
        </Button>
        <Button variant="outline" onClick={() => setPreset(90)}>
          Last 90d
        </Button>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={range.compare}
          onChange={(event) => setRange({ ...range, compare: event.target.checked })}
        />
        Compare to previous period
      </label>
    </div>
  )
}
