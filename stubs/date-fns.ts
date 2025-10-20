const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const

function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !Number.isNaN(value.getTime())
}

export function format(date: Date, token: string): string {
  if (!isValidDate(date)) {
    return ""
  }

  if (token === "MMM d, yyyy") {
    const month = MONTHS_SHORT[date.getMonth()] ?? ""
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day}, ${year}`
  }

  return date.toISOString()
}

export function isSameDay(a: Date | undefined, b: Date | undefined): boolean {
  if (!isValidDate(a) || !isValidDate(b)) {
    return false
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
