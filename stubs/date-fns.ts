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
