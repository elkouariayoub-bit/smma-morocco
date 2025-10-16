"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const description = "An interactive area chart"

type ChartPoint = {
  date: string
  desktop: number
  mobile: number
}

const chartData: ChartPoint[] = [
  {
    date: "2024-04-01",
    desktop: 316,
    mobile: 253,
  },
  {
    date: "2024-04-02",
    desktop: 329,
    mobile: 249,
  },
  {
    date: "2024-04-03",
    desktop: 343,
    mobile: 251,
  },
  {
    date: "2024-04-04",
    desktop: 358,
    mobile: 259,
  },
  {
    date: "2024-04-05",
    desktop: 374,
    mobile: 274,
  },
  {
    date: "2024-04-06",
    desktop: 389,
    mobile: 293,
  },
  {
    date: "2024-04-07",
    desktop: 403,
    mobile: 314,
  },
  {
    date: "2024-04-08",
    desktop: 415,
    mobile: 333,
  },
  {
    date: "2024-04-09",
    desktop: 426,
    mobile: 348,
  },
  {
    date: "2024-04-10",
    desktop: 434,
    mobile: 358,
  },
  {
    date: "2024-04-11",
    desktop: 440,
    mobile: 361,
  },
  {
    date: "2024-04-12",
    desktop: 445,
    mobile: 359,
  },
  {
    date: "2024-04-13",
    desktop: 449,
    mobile: 355,
  },
  {
    date: "2024-04-14",
    desktop: 453,
    mobile: 352,
  },
  {
    date: "2024-04-15",
    desktop: 458,
    mobile: 352,
  },
  {
    date: "2024-04-16",
    desktop: 462,
    mobile: 357,
  },
  {
    date: "2024-04-17",
    desktop: 468,
    mobile: 368,
  },
  {
    date: "2024-04-18",
    desktop: 476,
    mobile: 382,
  },
  {
    date: "2024-04-19",
    desktop: 484,
    mobile: 399,
  },
  {
    date: "2024-04-20",
    desktop: 493,
    mobile: 414,
  },
  {
    date: "2024-04-21",
    desktop: 502,
    mobile: 426,
  },
  {
    date: "2024-04-22",
    desktop: 511,
    mobile: 431,
  },
  {
    date: "2024-04-23",
    desktop: 518,
    mobile: 429,
  },
  {
    date: "2024-04-24",
    desktop: 524,
    mobile: 421,
  },
  {
    date: "2024-04-25",
    desktop: 527,
    mobile: 408,
  },
  {
    date: "2024-04-26",
    desktop: 527,
    mobile: 393,
  },
  {
    date: "2024-04-27",
    desktop: 524,
    mobile: 380,
  },
  {
    date: "2024-04-28",
    desktop: 518,
    mobile: 371,
  },
  {
    date: "2024-04-29",
    desktop: 509,
    mobile: 367,
  },
  {
    date: "2024-04-30",
    desktop: 497,
    mobile: 368,
  },
  {
    date: "2024-05-01",
    desktop: 484,
    mobile: 373,
  },
  {
    date: "2024-05-02",
    desktop: 469,
    mobile: 379,
  },
  {
    date: "2024-05-03",
    desktop: 455,
    mobile: 384,
  },
  {
    date: "2024-05-04",
    desktop: 441,
    mobile: 384,
  },
  {
    date: "2024-05-05",
    desktop: 429,
    mobile: 378,
  },
  {
    date: "2024-05-06",
    desktop: 419,
    mobile: 366,
  },
  {
    date: "2024-05-07",
    desktop: 412,
    mobile: 349,
  },
  {
    date: "2024-05-08",
    desktop: 406,
    mobile: 330,
  },
  {
    date: "2024-05-09",
    desktop: 404,
    mobile: 313,
  },
  {
    date: "2024-05-10",
    desktop: 403,
    mobile: 299,
  },
  {
    date: "2024-05-11",
    desktop: 403,
    mobile: 291,
  },
  {
    date: "2024-05-12",
    desktop: 405,
    mobile: 291,
  },
  {
    date: "2024-05-13",
    desktop: 407,
    mobile: 296,
  },
  {
    date: "2024-05-14",
    desktop: 408,
    mobile: 305,
  },
  {
    date: "2024-05-15",
    desktop: 409,
    mobile: 316,
  },
  {
    date: "2024-05-16",
    desktop: 408,
    mobile: 324,
  },
  {
    date: "2024-05-17",
    desktop: 407,
    mobile: 329,
  },
  {
    date: "2024-05-18",
    desktop: 405,
    mobile: 329,
  },
  {
    date: "2024-05-19",
    desktop: 403,
    mobile: 324,
  },
  {
    date: "2024-05-20",
    desktop: 401,
    mobile: 316,
  },
  {
    date: "2024-05-21",
    desktop: 400,
    mobile: 308,
  },
  {
    date: "2024-05-22",
    desktop: 400,
    mobile: 302,
  },
  {
    date: "2024-05-23",
    desktop: 403,
    mobile: 302,
  },
  {
    date: "2024-05-24",
    desktop: 408,
    mobile: 309,
  },
  {
    date: "2024-05-25",
    desktop: 416,
    mobile: 322,
  },
  {
    date: "2024-05-26",
    desktop: 427,
    mobile: 340,
  },
  {
    date: "2024-05-27",
    desktop: 441,
    mobile: 361,
  },
  {
    date: "2024-05-28",
    desktop: 456,
    mobile: 381,
  },
  {
    date: "2024-05-29",
    desktop: 474,
    mobile: 398,
  },
  {
    date: "2024-05-30",
    desktop: 492,
    mobile: 408,
  },
  {
    date: "2024-05-31",
    desktop: 510,
    mobile: 413,
  },
  {
    date: "2024-06-01",
    desktop: 527,
    mobile: 413,
  },
  {
    date: "2024-06-02",
    desktop: 542,
    mobile: 409,
  },
  {
    date: "2024-06-03",
    desktop: 554,
    mobile: 406,
  },
  {
    date: "2024-06-04",
    desktop: 564,
    mobile: 405,
  },
  {
    date: "2024-06-05",
    desktop: 571,
    mobile: 408,
  },
  {
    date: "2024-06-06",
    desktop: 575,
    mobile: 417,
  },
  {
    date: "2024-06-07",
    desktop: 577,
    mobile: 431,
  },
  {
    date: "2024-06-08",
    desktop: 577,
    mobile: 447,
  },
  {
    date: "2024-06-09",
    desktop: 575,
    mobile: 463,
  },
  {
    date: "2024-06-10",
    desktop: 573,
    mobile: 476,
  },
  {
    date: "2024-06-11",
    desktop: 570,
    mobile: 483,
  },
  {
    date: "2024-06-12",
    desktop: 569,
    mobile: 483,
  },
  {
    date: "2024-06-13",
    desktop: 568,
    mobile: 476,
  },
  {
    date: "2024-06-14",
    desktop: 568,
    mobile: 464,
  },
  {
    date: "2024-06-15",
    desktop: 569,
    mobile: 450,
  },
  {
    date: "2024-06-16",
    desktop: 571,
    mobile: 436,
  },
  {
    date: "2024-06-17",
    desktop: 572,
    mobile: 426,
  },
  {
    date: "2024-06-18",
    desktop: 573,
    mobile: 420,
  },
  {
    date: "2024-06-19",
    desktop: 573,
    mobile: 420,
  },
  {
    date: "2024-06-20",
    desktop: 572,
    mobile: 425,
  },
  {
    date: "2024-06-21",
    desktop: 568,
    mobile: 431,
  },
  {
    date: "2024-06-22",
    desktop: 562,
    mobile: 436,
  },
  {
    date: "2024-06-23",
    desktop: 553,
    mobile: 437,
  },
  {
    date: "2024-06-24",
    desktop: 542,
    mobile: 433,
  },
  {
    date: "2024-06-25",
    desktop: 530,
    mobile: 422,
  },
  {
    date: "2024-06-26",
    desktop: 516,
    mobile: 407,
  },
  {
    date: "2024-06-27",
    desktop: 501,
    mobile: 388,
  },
  {
    date: "2024-06-28",
    desktop: 487,
    mobile: 370,
  },
  {
    date: "2024-06-29",
    desktop: 474,
    mobile: 355,
  },
  {
    date: "2024-06-30",
    desktop: 463,
    mobile: 346,
  },
]

const chartConfig = {
  visitors: { label: "Visitors" },
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = React.useMemo(() => {
    return chartData.filter((item) => {
      const date = new Date(item.date)
      const referenceDate = new Date("2024-06-30")
      let daysToSubtract = 90
      if (timeRange === "30d") daysToSubtract = 30
      else if (timeRange === "7d") daysToSubtract = 7
      const startDate = new Date(referenceDate)
      startDate.setDate(startDate.getDate() - daysToSubtract)
      return date >= startDate
    })
  }, [timeRange])

  const stats = React.useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalVisitors: 0,
        desktopShare: "0%",
        trendLabel: "Stable",
      }
    }

    const totals = filteredData.reduce(
      (acc, point) => {
        acc.desktop += point.desktop
        acc.mobile += point.mobile
        return acc
      },
      { desktop: 0, mobile: 0 },
    )

    const totalVisitors = totals.desktop + totals.mobile
    const desktopShare = totalVisitors
      ? `${Math.round((totals.desktop / totalVisitors) * 100)}%`
      : "0%"

    const firstPoint = filteredData[0]
    const lastPoint = filteredData[filteredData.length - 1]
    const firstTotal = firstPoint.desktop + firstPoint.mobile
    const lastTotal = lastPoint.desktop + lastPoint.mobile
    const delta = firstTotal ? ((lastTotal - firstTotal) / firstTotal) * 100 : 0
    const roundedDelta = Number.isFinite(delta) ? delta : 0
    const trendLabel = `${roundedDelta >= 0 ? "▲" : "▼"} ${Math.abs(roundedDelta).toFixed(1)}% vs start`

    return {
      totalVisitors,
      desktopShare,
      trendLabel,
    }
  }, [filteredData])

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Audience Overview</CardTitle>
          <CardDescription>Visitors over time</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-6 px-2 pt-4 sm:px-6 sm:pt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-xs uppercase text-muted-foreground">Total visitors</p>
            <p className="text-2xl font-semibold tracking-tight">
              {stats.totalVisitors.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-xs uppercase text-muted-foreground">Desktop share</p>
            <p className="text-2xl font-semibold tracking-tight">{stats.desktopShare}</p>
          </div>
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-xs uppercase text-muted-foreground">Trend</p>
            <p className="text-2xl font-semibold tracking-tight">{stats.trendLabel}</p>
          </div>
        </div>
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value: string) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }
                  indicator="dot"
                />
              }
            />
            <Area dataKey="mobile" type="natural" fill="url(#fillMobile)" stroke="var(--color-mobile)" stackId="a" />
            <Area dataKey="desktop" type="natural" fill="url(#fillDesktop)" stroke="var(--color-desktop)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
