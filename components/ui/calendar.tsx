"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type CalendarRange = {
  from?: Date
  to?: Date
}

export type CalendarProps = {
  mode?: "single" | "range"
  numberOfMonths?: number
  selected?: CalendarRange
  onSelect?: (value: CalendarRange | undefined) => void
  className?: string
  defaultMonth?: Date
}

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfMonth(date: Date) {
  const next = startOfDay(date)
  next.setDate(1)
  return next
}

function addMonths(date: Date, amount: number) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

function isSameDay(a?: Date, b?: Date) {
  if (!a || !b) return false
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBefore(a: Date, b: Date) {
  return startOfDay(a).getTime() < startOfDay(b).getTime()
}

function normalizeRange(range?: CalendarRange) {
  if (!range?.from && !range?.to) {
    return { from: undefined, to: undefined }
  }

  const from = range?.from ? startOfDay(range.from) : undefined
  const to = range?.to ? startOfDay(range.to) : undefined

  if (from && to && isBefore(to, from)) {
    return { from: to, to: from }
  }

  return { from, to }
}

const monthFormatter = new Intl.DateTimeFormat(undefined, {
  month: "long",
  year: "numeric",
})

const weekdayFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
})

function getWeekdayLabels() {
  const reference = new Date(2024, 5, 2) // Sunday baseline
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(reference)
    day.setDate(reference.getDate() + index)
    return weekdayFormatter.format(day)
  })
}

function createDaysMatrix(month: Date) {
  const firstOfMonth = startOfMonth(month)
  const firstWeekday = firstOfMonth.getDay() // 0 Sunday
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()

  const matrix: Array<Array<Date | null>> = []
  let currentDay = 1 - firstWeekday

  while (currentDay <= daysInMonth) {
    const week: Array<Date | null> = []
    for (let i = 0; i < 7; i += 1) {
      const day = new Date(month.getFullYear(), month.getMonth(), currentDay)
      if (currentDay > 0 && currentDay <= daysInMonth) {
        week.push(day)
      } else {
        week.push(null)
      }
      currentDay += 1
    }
    matrix.push(week)
  }

  return matrix
}

export function Calendar({
  mode = "range",
  numberOfMonths = 1,
  selected,
  onSelect,
  className,
  defaultMonth,
}: CalendarProps) {
  const normalizedSelection = normalizeRange(selected)

  const initialMonth = React.useMemo(() => {
    if (defaultMonth) return startOfMonth(defaultMonth)
    if (normalizedSelection.from) return startOfMonth(normalizedSelection.from)
    return startOfMonth(new Date())
  }, [defaultMonth, normalizedSelection.from])

  const [visibleMonth, setVisibleMonth] = React.useState(initialMonth)

  React.useEffect(() => {
    if (normalizedSelection.from) {
      setVisibleMonth(startOfMonth(normalizedSelection.from))
    }
  }, [normalizedSelection.from])

  const months = React.useMemo(
    () =>
      Array.from({ length: Math.max(1, numberOfMonths) }, (_, index) =>
        addMonths(visibleMonth, index),
      ),
    [numberOfMonths, visibleMonth],
  )

  const weekdays = React.useMemo(() => getWeekdayLabels(), [])

  const handleDaySelect = React.useCallback(
    (day: Date) => {
      if (mode === "single") {
        onSelect?.({ from: day, to: day })
        return
      }

      const currentFrom = selected?.from ? startOfDay(selected.from) : undefined
      const currentTo = selected?.to ? startOfDay(selected.to) : undefined

      if (!currentFrom || (currentFrom && currentTo)) {
        onSelect?.({ from: day, to: undefined })
        return
      }

      if (day < currentFrom) {
        onSelect?.({ from: day, to: currentFrom })
        return
      }

      onSelect?.({ from: currentFrom, to: day })
    },
    [mode, onSelect, selected?.from, selected?.to],
  )

  const isInRange = React.useCallback(
    (day: Date) => {
      const { from, to } = normalizedSelection
      if (!from) return false
      const current = startOfDay(day).getTime()
      const start = startOfDay(from).getTime()
      const end = startOfDay((to ?? from)).getTime()
      if (start === end) {
        return current === start
      }
      return current >= start && current <= end
    },
    [normalizedSelection],
  )

  const goToPreviousMonth = React.useCallback(() => {
    setVisibleMonth((prev) => addMonths(prev, -1))
  }, [])

  const goToNextMonth = React.useCallback(() => {
    setVisibleMonth((prev) => addMonths(prev, 1))
  }, [])

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between px-2">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm hover:bg-muted"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex flex-1 justify-center gap-6 text-sm font-medium">
          {months.map((month) => (
            <span key={`${month.getFullYear()}-${month.getMonth()}`} className="min-w-[120px] text-center">
              {monthFormatter.format(month)}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={goToNextMonth}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-sm hover:bg-muted"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        {months.map((month) => {
          const matrix = createDaysMatrix(month)
          return (
            <div key={`${month.getFullYear()}-${month.getMonth()}`} className="flex flex-col gap-2">
              <div className="grid grid-cols-7 gap-1 px-2 text-[0.7rem] font-medium uppercase text-muted-foreground">
                {weekdays.map((weekday) => (
                  <span key={`${month.getFullYear()}-${month.getMonth()}-${weekday}`} className="text-center">
                    {weekday}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 px-2">
                {matrix.map((week, weekIndex) => (
                  <React.Fragment key={`${month.getFullYear()}-${month.getMonth()}-week-${weekIndex}`}>
                    {week.map((day, dayIndex) => {
                      if (!day) {
                        return <span key={`empty-${weekIndex}-${dayIndex}`} />
                      }

                      const isSelectedStart = normalizedSelection.from && isSameDay(day, normalizedSelection.from)
                      const isSelectedEnd = normalizedSelection.to && isSameDay(day, normalizedSelection.to)
                      const selectedState = isInRange(day)
                      const isToday = isSameDay(day, new Date())

                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          onClick={() => handleDaySelect(day)}
                          className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                            selectedState && "bg-primary/10 text-primary",
                            (isSelectedStart || isSelectedEnd) && "bg-primary text-primary-foreground",
                            isToday && !selectedState && "ring-1 ring-primary/50",
                            "hover:bg-primary/10 hover:text-primary",
                          )}
                        >
                          {day.getDate()}
                        </button>
                      )
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
