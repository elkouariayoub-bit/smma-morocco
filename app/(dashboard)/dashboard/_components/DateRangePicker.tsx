"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type DateRangePickerProps = {
  value?: DateRange
  onChange?: (range: DateRange | undefined) => void
  className?: string
}

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const start = value?.from
  const end = value?.to

  const label = React.useMemo(() => {
    if (start && end) {
      return `${format(start, "MMM d, yyyy")} — ${format(end, "MMM d, yyyy")}`
    }
    if (start) {
      return `${format(start, "MMM d, yyyy")} — ...`
    }
    return "Pick a date range"
  }, [start, end])

  const handleSelect = React.useCallback(
    (range: DateRange | undefined) => {
      onChange?.(range)
      if (range?.from && range?.to) {
        setOpen(false)
      }
    },
    [onChange]
  )

  const handleClear = React.useCallback(() => {
    onChange?.(undefined)
  }, [onChange])

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !start && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={2}
            defaultMonth={start ?? new Date()}
          />
        </PopoverContent>
      </Popover>
      <Button variant="ghost" className="text-xs text-muted-foreground" onClick={handleClear}>
        Clear
      </Button>
    </div>
  )
}
