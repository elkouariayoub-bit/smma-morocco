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
  const [mode, setMode] = React.useState<PickerMode>("range")

  const hasRange = value?.from && value?.to && value.from.getTime() !== value.to.getTime()
  const hasSingle = value?.from && value?.to && value.from.getTime() === value.to.getTime()
  const placeholder = "Pick a date or range"

  const label = React.useMemo(() => {
    if (hasRange && value?.from && value?.to) {
      return `${format(value.from, "MMM d, yyyy")} — ${format(value.to, "MMM d, yyyy")}`
    }
    if (value?.from && hasSingle) {
      return format(value.from, "MMM d, yyyy")
    }
    if (value?.from && !value.to) {
      return format(value.from, "MMM d, yyyy")
    }
    return placeholder
  }, [hasRange, hasSingle, value?.from, value?.to])

  const handleSelect = React.useCallback(
    (next: DateRange | undefined) => {
      if (!onChange) return
      onChange(next)
      if (!next) {
        return
      }
      if (mode === "single" && next.from) {
        setOpen(false)
        return
      }
      if (next.from && next.to) {
        setOpen(false)
      }
    },
    [mode, onChange],
  )

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[260px] justify-start text-left font-normal",
              !value?.from && "text-muted-foreground",
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
          <div className="flex items-center gap-1 rounded-md border bg-background p-1 text-xs font-medium">
            <Button
              type="button"
              size="sm"
              variant={mode === "single" ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setMode("single")}
            >
              Single day
            </Button>
            <Button
              type="button"
              size="sm"
              variant={mode === "range" ? "default" : "ghost"}
              className="h-7 px-3 text-xs"
              onClick={() => setMode("range")}
            >
              Date range
            </Button>
          </div>

          <Calendar
            mode={mode}
            numberOfMonths={mode === "range" ? 2 : 1}
            selected={value}
            onSelect={handleSelect}
            captionLayout={mode === "single" ? "dropdown" : undefined}
            className="rounded-md border"
            defaultMonth={value?.from}
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
