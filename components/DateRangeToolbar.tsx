"use client"

import DateRangePicker from "@/components/DateRangePicker"
import { useDateRange } from "@/app/providers/date-range"

export default function DateRangeToolbar() {
  const { range, setRange } = useDateRange()

  const setPreset = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - (days - 1))
    setRange({ start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10), compare: range.compare })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <DateRangePicker />
      <div className="flex items-center gap-2">
        <button onClick={() => setPreset(7)} className="rounded-md border px-3 py-2 text-sm">
          Last 7d
        </button>
        <button onClick={() => setPreset(30)} className="rounded-md border px-3 py-2 text-sm">
          Last 30d
        </button>
        <button onClick={() => setPreset(90)} className="rounded-md border px-3 py-2 text-sm">
          Last 90d
        </button>
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
