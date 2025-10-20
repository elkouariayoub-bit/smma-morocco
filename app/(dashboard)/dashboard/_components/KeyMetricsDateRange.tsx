"use client"

import * as React from "react"
import { format, isSameDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
  const [mode, setMode] = React.useState<"single" | "range">(
    value?.from && value?.to && isSameDay(value.from, value.to) ? "single" : "range",
  )
  const [singleDate, setSingleDate] = React.useState<Date | undefined>(() => {
    if (value?.from && value?.to && isSameDay(value.from, value.to)) {
      return value.from
    }
    return undefined
  })

  React.useEffect(() => {
    if (value?.from && value?.to && isSameDay(value.from, value.to)) {
      setMode("single")
      setSingleDate(value.from)
      return
    }
    if (value?.from || value?.to) {
      setMode("range")
      setSingleDate(undefined)
      return
    }
    setSingleDate(undefined)
  }, [value?.from, value?.to])

  const label =
    value?.from && value?.to
      ? isSameDay(value.from, value.to)
        ? format(value.from, "MMM d, yyyy")
        : `${format(value.from, "MMM d, yyyy")} — ${format(value.to, "MMM d, yyyy")}`
      : value?.from
      ? format(value.from, "MMM d, yyyy")
      : "Pick a date or range"

  const handleRangeChange = React.useCallback(
    (range: DateRange | undefined) => {
      onChange?.(range)
      if (range?.from && range?.to) {
        setOpen(false)
      }
    },
    [onChange],
  )

  const handleSingleChange = React.useCallback(
    (range: DateRange | undefined) => {
      const date = range?.from
      setSingleDate(date)
      onChange?.(date ? { from: date, to: date } : undefined)
      if (date) {
        setOpen(false)
      }
    },
    [onChange],
  )

  const activeRange = React.useMemo<DateRange | undefined>(() => {
    if (mode === "single") {
      if (singleDate) {
        return { from: singleDate, to: singleDate }
      }
      return undefined
    }
    return value
  }, [mode, singleDate, value])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !value?.from && "text-muted-foreground"
            )}
            aria-label="Pick a date or range"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          side="bottom"
          align="start"
          sideOffset={8}
          className="z-50 w-auto p-2 rounded-xl border bg-popover shadow-lg"
        >
          <div className="flex items-center justify-between gap-2 px-2 pb-3">
            <span className="text-xs font-medium text-muted-foreground">Selection mode</span>
            <div className="flex gap-1">
              <Button
                type="button"
                size="sm"
                variant={mode === "single" ? "secondary" : "ghost"}
                onClick={() => {
                  setMode("single")
                  if (value?.from) {
                    setSingleDate(value.from)
                  }
                }}
                aria-pressed={mode === "single"}
              >
                Day
              </Button>
              <Button
                type="button"
                size="sm"
                variant={mode === "range" ? "secondary" : "ghost"}
                onClick={() => {
                  setMode("range")
                }}
                aria-pressed={mode === "range"}
              >
                Range
              </Button>
            </div>
          </div>
          <Calendar
            mode={mode}
            numberOfMonths={mode === "range" ? 2 : 1}
            selected={activeRange}
            onSelect={mode === "single" ? handleSingleChange : handleRangeChange}
            className="rounded-md border"
            defaultMonth={activeRange?.from}
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        className="text-xs text-muted-foreground"
        onClick={() => {
          setMode("range")
          setSingleDate(undefined)
          onChange?.(undefined)
        }}
      >
        Clear
      </Button>
    </div>
  )
}
