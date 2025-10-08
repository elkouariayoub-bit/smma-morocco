"use client"
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
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-300">Start</label>
        <input
          type="date"
          value={range.start}
          onChange={(e) => setRange({ ...range, start: e.target.value })}
          className="rounded-md border bg-transparent px-2 py-1"
        />
        <label className="text-sm text-gray-600 dark:text-gray-300">End</label>
        <input
          type="date"
          value={range.end}
          onChange={(e) => setRange({ ...range, end: e.target.value })}
          className="rounded-md border bg-transparent px-2 py-1"
        />
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => setPreset(7)} className="rounded-md border px-2 py-1">Last 7d</button>
        <button onClick={() => setPreset(30)} className="rounded-md border px-2 py-1">Last 30d</button>
        <button onClick={() => setPreset(90)} className="rounded-md border px-2 py-1">Last 90d</button>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={range.compare}
          onChange={(e) => setRange({ ...range, compare: e.target.checked })}
        />
        Compare to previous period
      </label>
    </div>
  )
}
