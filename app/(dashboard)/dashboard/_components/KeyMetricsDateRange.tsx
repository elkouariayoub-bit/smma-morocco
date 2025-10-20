"use client"

import * as React from "react"
import { format } from "date-fns"
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

  const label =
    value?.from && value?.to
      ? `${format(value.from, "MMM d, yyyy")} — ${format(value.to, "MMM d, yyyy")}`
      : "Pick a date or range"

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
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={value}
            onSelect={(r) => onChange?.(r)}
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
