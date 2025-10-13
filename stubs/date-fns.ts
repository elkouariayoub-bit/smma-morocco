"use client"

export type Locale = {
  options?: Intl.DateTimeFormatOptions
}

type DateInput = Date | string | number

function toDateInternal(value: DateInput): Date {
  if (value instanceof Date) {
    return new Date(value.getTime())
  }

  if (typeof value === 'number') {
    return new Date(value)
  }

  const parsed = new Date(value)
  return parsed
}

function ensureValidDate(date: Date): Date {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid time value')
  }
  return date
}

function formatTokensToOptions(formatStr: string): Intl.DateTimeFormatOptions {
  const options: Intl.DateTimeFormatOptions = {}

  if (formatStr.includes('yyyy') || formatStr.includes('yy')) {
    options.year = 'numeric'
  }

  if (formatStr.includes('MMMM')) {
    options.month = 'long'
  } else if (formatStr.includes('MMM')) {
    options.month = 'short'
  } else if (formatStr.includes('MM')) {
    options.month = '2-digit'
  }

  if (formatStr.includes('dd')) {
    options.day = '2-digit'
  } else if (formatStr.includes('d')) {
    options.day = 'numeric'
  }

  if (formatStr.includes('HH')) {
    options.hour = '2-digit'
    options.hourCycle = 'h23'
  } else if (formatStr.includes('hh')) {
    options.hour = '2-digit'
    options.hour12 = formatStr.includes('a')
  }

  if (formatStr.includes('mm')) {
    options.minute = '2-digit'
  }

  if (formatStr.includes('ss')) {
    options.second = '2-digit'
  }

  if (formatStr.includes('a')) {
    options.hour12 = true
  }

  if (!options.year && !options.month && !options.day && !options.hour) {
    options.year = 'numeric'
    options.month = 'short'
    options.day = 'numeric'
  }

  return options
}

export function format(input: DateInput, formatStr: string, options?: { locale?: Locale }) {
  const date = ensureValidDate(toDateInternal(input))
  const formatter = new Intl.DateTimeFormat(undefined, {
    ...formatTokensToOptions(formatStr),
    ...(options?.locale?.options ?? {}),
  })
  return formatter.format(date)
}

export function parseISO(value: string) {
  return new Date(value)
}

export function isValid(input: DateInput) {
  return !Number.isNaN(toDateInternal(input).getTime())
}

export function addDays(input: DateInput, amount: number) {
  const date = ensureValidDate(toDateInternal(input))
  const result = new Date(date)
  result.setDate(result.getDate() + amount)
  return result
}

export function differenceInCalendarDays(left: DateInput, right: DateInput) {
  const start = startOfDay(left).getTime()
  const end = startOfDay(right).getTime()
  const diff = start - end
  const oneDay = 24 * 60 * 60 * 1000
  return Math.round(diff / oneDay)
}

export function compareAsc(left: DateInput, right: DateInput) {
  const leftTime = toDateInternal(left).getTime()
  const rightTime = toDateInternal(right).getTime()
  if (leftTime === rightTime) return 0
  return leftTime < rightTime ? -1 : 1
}

export function isAfter(left: DateInput, right: DateInput) {
  return toDateInternal(left).getTime() > toDateInternal(right).getTime()
}

export function isBefore(left: DateInput, right: DateInput) {
  return toDateInternal(left).getTime() < toDateInternal(right).getTime()
}

export function startOfDay(input: DateInput) {
  const date = ensureValidDate(toDateInternal(input))
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function isSameDay(left: DateInput, right: DateInput) {
  return startOfDay(left).getTime() === startOfDay(right).getTime()
}

export function toDate(input: DateInput): Date {
  return ensureValidDate(new Date(input instanceof Date ? input.getTime() : input))
}

export function parse(value: string, _pattern: string, referenceDate: DateInput) {
  // Minimal implementation: fallback to Date constructor relative to reference date when possible.
  const direct = new Date(value)
  if (!Number.isNaN(direct.getTime())) {
    return direct
  }
  return toDateInternal(referenceDate)
}

export function formatISO(input: DateInput) {
  return ensureValidDate(toDateInternal(input)).toISOString()
}

export function min(dates: DateInput[]) {
  if (!dates.length) throw new Error('min requires at least one date')
  return dates
    .map((date) => toDateInternal(date))
    .reduce((acc, current) => (acc.getTime() <= current.getTime() ? acc : current))
}

export function max(dates: DateInput[]) {
  if (!dates.length) throw new Error('max requires at least one date')
  return dates
    .map((date) => toDateInternal(date))
    .reduce((acc, current) => (acc.getTime() >= current.getTime() ? acc : current))
}

export function isWithinInterval(input: DateInput, interval: { start: DateInput; end: DateInput }) {
  const time = toDateInternal(input).getTime()
  const startTime = toDateInternal(interval.start).getTime()
  const endTime = toDateInternal(interval.end).getTime()
  return time >= startTime && time <= endTime
}

export function isFuture(input: DateInput) {
  return toDateInternal(input).getTime() > Date.now()
}

export function isPast(input: DateInput) {
  return toDateInternal(input).getTime() < Date.now()
}

export function formatDistanceStrict(left: DateInput, right: DateInput) {
  const diff = Math.abs(toDateInternal(left).getTime() - toDateInternal(right).getTime())
  const oneDay = 24 * 60 * 60 * 1000
  const days = Math.round(diff / oneDay)
  if (days === 0) return 'today'
  if (days === 1) return '1 day'
  return `${days} days`
}
