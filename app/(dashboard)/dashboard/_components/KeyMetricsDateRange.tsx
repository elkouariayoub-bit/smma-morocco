"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function isSameDayValue(a?: Date, b?: Date) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

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
  const [mode, setMode] = React.useState<"single" | "range">(() => {
    if (value?.from && value?.to && isSameDayValue(value.from, value.to)) {
      return "single"
    }
    return "range"
  })

  React.useEffect(() => {
    if (value?.from && value?.to && isSameDayValue(value.from, value.to)) {
      setMode("single")
    } else if (value?.from || value?.to) {
      setMode((current) => (current === "range" ? current : "range"))
    }
  }, [value?.from, value?.to])

  const label = value?.from
    ? value?.to
      ? isSameDayValue(value.from, value.to)
        ? format(value.from, "MMM d, yyyy")
        : `${format(value.from, "MMM d, yyyy")} — ${format(value.to, "MMM d, yyyy")}`
      : format(value.from, "MMM d, yyyy")
    : "Pick a date or range"

  const handleSelect = React.useCallback(
    (rangeValue: DateRange | undefined) => {
      if (!rangeValue?.from) {
        onChange?.(undefined)
        return
      }

      if (mode === "single") {
        onChange?.({ from: rangeValue.from, to: rangeValue.from })
        setOpen(false)
        return
      }

      onChange?.(rangeValue)
      if (rangeValue.from && rangeValue.to) {
        setOpen(false)
      }
    },
    [mode, onChange]
  )

  const toggleMode = (nextMode: "single" | "range") => {
    setMode(nextMode)

    if (!value?.from && !value?.to) {
      return
    }

    if (nextMode === "single" && value?.from) {
      onChange?.({ from: value.from, to: value.from })
    }

    if (nextMode === "range" && value?.from && value?.to && isSameDayValue(value.from, value.to)) {
      onChange?.({ from: value.from, to: value.to })
    }
  }

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
          <div className="flex gap-2 p-1">
            <Button
              type="button"
              size="sm"
              variant={mode === "range" ? "default" : "ghost"}
              onClick={() => toggleMode("range")}
            >
              Range
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "single" ? "default" : "ghost"}
              onClick={() => toggleMode("single")}
            >
              Single day
            </Button>
          </div>

          <Calendar
            mode={mode === "single" ? "single" : "range"}
            selected={value}
            onSelect={handleSelect}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        className="text-xs text-muted-foreground"
        onClick={() => onChange?.(undefined)}
      >
        Clear
      </Button>
    </div>
  )
}
