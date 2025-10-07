export type KpiPoint = { label: string; value: number }
export type KpiSeries = KpiPoint[]

export type Range = { start: string; end: string }

function genDays(start: string, end: string): string[] {
  const dates: string[] = []
  let current = new Date(start)
  const until = new Date(end)
  while (current <= until) {
    dates.push(current.toISOString().slice(0, 10))
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function mockSeries(range: Range, base: number, variance = 0.15): KpiSeries {
  const days = genDays(range.start, range.end)
  return days.map((iso, index) => ({
    label: iso,
    value: Math.round(base * (1 + Math.sin(index / 2) * variance)),
  }))
}

// Engagement rate % (0–10), Impressions, People
export async function getKpis(range: Range) {
  // TODO: Replace with real DB/provider logic
  const engagementRate = mockSeries(range, 5) // %
  const impressions = mockSeries(range, 16000)
  const people = mockSeries(range, 7000)
  return { engagementRate, impressions, people }
}

export function previousRange(range: Range): Range {
  const start = new Date(range.start)
  const end = new Date(range.end)
  const diff = Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1
  const prevEnd = new Date(range.start)
  prevEnd.setDate(prevEnd.getDate() - 1)
  const prevStart = new Date(prevEnd)
  prevStart.setDate(prevStart.getDate() - (diff - 1))
  return {
    start: prevStart.toISOString().slice(0, 10),
    end: prevEnd.toISOString().slice(0, 10),
  }
}
