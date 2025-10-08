"use client"

import { useMemo } from "react"

import { useDateRange } from "@/app/providers/date-range"

export default function ExportButton() {
  const { range } = useDateRange()

  const href = useMemo(() => {
    const params = new URLSearchParams({ start: range.start, end: range.end })
    return `/api/export/csv?${params.toString()}`
  }, [range.end, range.start])

  return (
    <a
      href={href}
      className="inline-flex items-center justify-center rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-neutral-800"
    >
      Export CSV
    </a>
  )
}
