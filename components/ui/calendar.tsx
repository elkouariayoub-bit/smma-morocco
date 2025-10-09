"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

type DateRangeValue = { from?: Date; to?: Date }

export type CalendarProps = {
  mode?: "single" | "range"
  selected?: Date | DateRangeValue
  onSelect?: (value: Date | DateRangeValue | undefined) => void
  numberOfMonths?: number
  captionLayout?: "buttons" | "dropdown"
  showOutsideDays?: boolean
  className?: string
  classNames?: Record<string, string>
  fromYear?: number
  toYear?: number
  components?: Record<string, React.ComponentType<any>>
}

type CalendarClassNames = NonNullable<NonNullable<CalendarProps["classNames"]>>

type LoadedDayPicker = React.ComponentType<CalendarProps & { classNames?: Record<string, string> }>

const defaultClassNames: CalendarClassNames = {
  months: "flex flex-col gap-4 sm:flex-row sm:gap-4",
  month: "space-y-4",
  caption: "flex justify-center pt-1 relative items-center",
  caption_label: "text-sm font-medium",
  nav: "space-x-2 flex items-center",
  nav_button: cn(
    "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100",
    "inline-flex items-center justify-center rounded-md border"
  ),
  nav_button_previous: "absolute left-1",
  nav_button_next: "absolute right-1",
  table: "w-full border-collapse space-y-1",
  head_row: "flex",
  head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
  row: "flex w-full mt-2",
  cell: "text-center text-sm p-0 relative",
  day: cn(
    "h-9 w-9 rounded-md border border-transparent p-0 font-normal",
    "aria-selected:opacity-100"
  ),
  day_range_start: "day-range-start",
  day_range_end: "day-range-end",
  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
  day_selected:
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
  day_today: "bg-accent text-accent-foreground",
  day_outside: "day-outside text-muted-foreground opacity-50",
  day_disabled: "text-muted-foreground opacity-50",
  day_hidden: "invisible",
}

export function Calendar({ className, classNames, showOutsideDays = true, components, ...props }: CalendarProps) {
  const [DayPicker, setDayPicker] = React.useState<LoadedDayPicker | null>(null)

  React.useEffect(() => {
    let cancelled = false

    const load = async () => {
      const moduleName: string = "react-day-picker"
      try {
        const mod: any = await import(moduleName)
        if (!cancelled) {
          const Component = (mod?.DayPicker ?? mod?.default) as LoadedDayPicker | undefined
          if (Component) {
            setDayPicker(() => Component)
            return
          }
        }
      } catch (error) {
        console.warn("react-day-picker import failed; falling back to stub", error)
      }

      if (!cancelled) {
        const fallback = await import("../../stubs/react-day-picker")
        setDayPicker(() => (fallback.DayPicker as LoadedDayPicker))
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  if (!DayPicker) {
    return (
      <div
        className={cn(
          "p-6 text-sm text-muted-foreground",
          "rounded-md border border-dashed",
          className
        )}
      >
        Loading calendar…
      </div>
    )
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{ ...defaultClassNames, ...classNames }}
      components={{
        IconLeft: ({ className, ...iconProps }) => (
          <ChevronLeft className={cn("h-4 w-4", className)} {...iconProps} />
        ),
        IconRight: ({ className, ...iconProps }) => (
          <ChevronRight className={cn("h-4 w-4", className)} {...iconProps} />
        ),
        ...components,
      }}
      {...props}
    />
  )
}
