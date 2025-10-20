"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type PickerMode = "single" | "range"

const isSameDay = (a?: Date, b?: Date) =>
  Boolean(
    a &&
      b &&
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate(),
  )

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
  const [mode, setMode] = React.useState<PickerMode>(() =>
    value?.from && value?.to && isSameDay(value.from, value.to) ? "single" : "range",
  )
  const [singleDate, setSingleDate] = React.useState<Date | undefined>(value?.from)
  const [rangeValue, setRangeValue] = React.useState<DateRange | undefined>(value)

  React.useEffect(() => {
    setRangeValue(value)
    if (value?.from && value?.to && isSameDay(value.from, value.to)) {
      setSingleDate(value.from)
      setMode("single")
    } else if (value?.from || value?.to) {
      setMode("range")
    }
  }, [value])

  const label = React.useMemo(() => {
    if (mode === "single") {
      return singleDate ? format(singleDate, "MMM d, yyyy") : "Pick a date or range"
    }
    if (rangeValue?.from && rangeValue?.to) {
      return `${format(rangeValue.from, "MMM d, yyyy")} — ${format(rangeValue.to, "MMM d, yyyy")}`
    }
    return "Pick a date or range"
  }, [mode, rangeValue?.from, rangeValue?.to, singleDate])

  const handleModeChange = (next: PickerMode) => {
    setMode(next)
    if (next === "single") {
      setSingleDate((prev) => prev ?? rangeValue?.from ?? new Date())
    } else {
      setRangeValue((prev) => prev ?? (singleDate ? { from: singleDate, to: singleDate } : undefined))
    }
  }

  const handleSingleSelect = (range?: DateRange) => {
    const date = range?.from
    setSingleDate(date)
    if (date) {
      onChange?.({ from: date, to: date })
      setOpen(false)
    } else {
      onChange?.(undefined)
    }
  }

  const handleRangeSelect = (range?: DateRange) => {
    setRangeValue(range)
    if (range?.from && range?.to) {
      onChange?.(range)
      setOpen(false)
    } else if (range?.from) {
      onChange?.({ from: range.from, to: range.from })
    } else {
      onChange?.(undefined)
    }
  }

  const handleClear = () => {
    setSingleDate(undefined)
    setRangeValue(undefined)
    onChange?.(undefined)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !singleDate && !rangeValue?.from && "text-muted-foreground",
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
          className="z-50 w-auto rounded-xl border bg-popover shadow-lg"
        >
          <div className="flex flex-col gap-3 p-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={mode === "single" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("single")}
              >
                Single day
              </Button>
              <Button
                type="button"
                variant={mode === "range" ? "default" : "ghost"}
                size="sm"
                onClick={() => handleModeChange("range")}
              >
                Date range
              </Button>
            </div>

            {mode === "single" ? (
              <Calendar
                mode="single"
                selected={singleDate ? { from: singleDate, to: singleDate } : undefined}
                onSelect={handleSingleSelect as (value: DateRange | undefined) => void}
                className="rounded-md border shadow-sm"
                captionLayout="dropdown"
              />
            ) : (
              <Calendar
                mode="range"
                numberOfMonths={2}
                selected={rangeValue}
                onSelect={handleRangeSelect}
                className="rounded-md border shadow-sm"
              />
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Button variant="ghost" className="text-xs text-muted-foreground" onClick={handleClear}>
        Clear
      </Button>
    </div>
  )
}
