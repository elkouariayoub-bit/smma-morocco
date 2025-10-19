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

type Props = {
  mode?: PickerMode
  className?: string
  // single-date mode
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  // range mode
  range?: DateRange
  onRangeChange?: (range: DateRange | undefined) => void
  buttonClassName?: string
  buttonAriaLabel?: string
}

export function DateOrRangePicker({
  mode = "range",
  className,
  date,
  onDateChange,
  range,
  onRangeChange,
  buttonClassName,
  buttonAriaLabel = "Pick a date or range",
}: Props) {
  const [open, setOpen] = React.useState(false)

  const singleSelection = React.useMemo<DateRange | undefined>(() => {
    if (mode !== "single" || !date) {
      return undefined
    }
    return { from: date, to: date }
  }, [mode, date])

  const label = React.useMemo(() => {
    if (mode === "single") {
      return date ? format(date, "MMM d, yyyy") : "Pick a date or range"
    }
    if (range?.from && range?.to) {
      return `${format(range.from, "MMM d, yyyy")} — ${format(range.to, "MMM d, yyyy")}`
    }
    if (range?.from) {
      return format(range.from, "MMM d, yyyy")
    }
    return "Pick a date or range"
  }, [mode, date, range?.from, range?.to])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-label={buttonAriaLabel}
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              mode === "single" ? !date && "text-muted-foreground" : !range?.from && "text-muted-foreground",
              buttonClassName,
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="end">
          {mode === "single" ? (
            <Calendar
              mode="single"
              selected={singleSelection}
              onSelect={(selected) => {
                onDateChange?.(selected?.from)
                setOpen(false)
              }}
              className="rounded-md border shadow-sm"
              captionLayout="dropdown"
            />
          ) : (
            <Calendar
              mode="range"
              selected={range}
              onSelect={(selected) => {
                onRangeChange?.(selected ?? undefined)
                if (selected?.from && selected?.to) {
                  setOpen(false)
                }
              }}
              numberOfMonths={2}
              className="rounded-md border shadow-sm"
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
