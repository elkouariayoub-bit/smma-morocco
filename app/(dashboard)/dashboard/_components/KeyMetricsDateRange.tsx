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
  const [mode, setMode] = React.useState<"single" | "range">("range")

  React.useEffect(() => {
    if (value?.from && value?.to && isSameDay(value.from, value.to)) {
      setMode("single")
    }
  }, [value?.from, value?.to])

  const label =
    value?.from && value?.to
      ? isSameDay(value.from, value.to)
        ? format(value.from, "MMM d, yyyy")
        : `${format(value.from, "MMM d, yyyy")} — ${format(value.to, "MMM d, yyyy")}`
      : value?.from
        ? format(value.from, "MMM d, yyyy")
        : "Pick a date or range"

  const handleSelectSingle = (range?: DateRange) => {
    if (!range?.from) {
      onChange?.(undefined)
      return
    }
    const next: DateRange = { from: range.from, to: range.from }
    onChange?.(next)
    setOpen(false)
  }

  const handleSelectRange = (range?: DateRange) => {
    onChange?.(range)
    if (range?.from && range?.to) {
      setOpen(false)
    }
  }

  const handleModeChange = (nextMode: "single" | "range") => {
    setMode(nextMode)
    if (!onChange) return
    if (nextMode === "single") {
      if (value?.from) {
        onChange({ from: value.from, to: value.from })
      }
      return
    }
    if (value?.from) {
      onChange({ from: value.from, to: !value.to || isSameDay(value.from, value.to) ? undefined : value.to })
    } else {
      onChange(undefined)
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
          className="z-50 w-auto space-y-3 rounded-xl border bg-popover p-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">Selection mode</span>
            <div className="grid grid-cols-2 gap-1">
              <Button
                size="sm"
                variant={mode === "single" ? "secondary" : "ghost"}
                onClick={() => handleModeChange("single")}
              >
                Single
              </Button>
              <Button
                size="sm"
                variant={mode === "range" ? "secondary" : "ghost"}
                onClick={() => handleModeChange("range")}
              >
                Range
              </Button>
            </div>
          </div>
          <Calendar
            mode={mode === "single" ? "single" : "range"}
            numberOfMonths={mode === "single" ? 1 : 2}
            selected={
              mode === "single"
                ? value?.from
                  ? { from: value.from, to: value.from }
                  : undefined
                : value
            }
            onSelect={(selection) => {
              if (mode === "single") {
                handleSelectSingle(selection as DateRange | undefined)
              } else {
                handleSelectRange(selection as DateRange | undefined)
              }
            }}
            captionLayout="dropdown"
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>

      <Button
        variant="ghost"
        className="text-xs text-muted-foreground"
        onClick={() => {
          onChange?.(undefined)
          setMode("range")
        }}
      >
        Clear
      </Button>
    </div>
  )
}
