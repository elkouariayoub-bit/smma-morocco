"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

export function KeyMetricsDateRange({
  value,
  onChange,
  className,
}: {
  value?: DateRange
  onChange?: (r: DateRange | undefined) => void
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  const label =
    value?.from && value?.to
      ? `${format(value.from, "MMM d, yyyy")} — ${format(value.to, "MMM d, yyyy")}`
      : "Pick a date or range"

  const containerRef = React.useRef<HTMLDivElement>(null)

  const handleSelect = React.useCallback(
    (range: DateRange | undefined) => {
      onChange?.(range)
      if (range?.from && range?.to) {
        setOpen(false)
      }
    },
    [onChange],
  )

  React.useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div ref={containerRef} className="relative">
        <Button
          variant="outline"
          className={cn(
            "w-[260px] justify-start text-left font-normal",
            !value?.from && "text-muted-foreground"
          )}
          aria-label="Pick a date or range"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {label}
        </Button>

        {open ? (
          <div className="absolute left-0 z-50 mt-2 rounded-xl border bg-popover p-2 shadow-lg">
            <Calendar
              mode="range"
              numberOfMonths={2}
              selected={value}
              onSelect={handleSelect}
              className="rounded-md border"
            />
          </div>
        ) : null}
      </div>

      <Button
        variant="ghost"
        className="text-xs text-muted-foreground"
        onClick={() => {
          onChange?.(undefined)
          setOpen(false)
        }}
      >
        Clear
      </Button>
    </div>
  )
}
