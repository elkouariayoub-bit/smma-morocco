"use client"

import { type ReactNode, useCallback, useMemo, useState } from "react"
import Link from "next/link"

import { Header } from "@/components/Header"
import { Card, type CardProps } from "@/components/Card"
import { PlatformCard } from "@/components/PlatformCard"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/fade-in"
import { Plus, TrendingUp, Facebook as FacebookIcon, Instagram as InstagramIcon, Twitter } from "lucide-react"

import { format } from "date-fns"
import type { DateRange } from "react-day-picker"
import { DateRangePicker } from "@/app/(dashboard)/dashboard/_components/DateRangePicker"
import { DashboardKPI } from "@/app/(dashboard)/dashboard/_components/DashboardKPI"
import { computeStats, formatCompact } from "@/app/(dashboard)/dashboard/_lib/analytics"
import {
  buildCSV,
  buildPDF,
  buildXLSX,
  downloadBlob,
  type Interval,
} from "@/app/(dashboard)/dashboard/_lib/exports"

interface Platform {
  name: string
  followers: string
  engagement: string
  posts: number
  icon: ReactNode
  accentClassName?: string
}

const performanceMetrics: CardProps[] = [
  {
    title: "Total Amount Spent in Ads",
    value: "$4,210",
    description: "Current month across campaigns",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    title: "Total Revenue from Ads",
    value: "$12,430",
    description: "Attributed across all channels",
    icon: <TrendingUp className="h-5 w-5" />,
  },
]

const platformOverview: Platform[] = [
  {
    name: "Facebook",
    followers: "45.2K",
    engagement: "3.8%",
    posts: 127,
    accentClassName:
      "bg-[#2563eb]/10 text-[#2563eb] ring-[#2563eb]/20 dark:bg-[#2563eb]/20 dark:text-[#93c5fd] dark:ring-[#2563eb]/40",
    icon: <FacebookIcon className="h-5 w-5" />,
  },
  {
    name: "Instagram",
    followers: "67.9K",
    engagement: "5.1%",
    posts: 203,
    accentClassName: "bg-pink-100 text-pink-600 ring-pink-200 dark:bg-pink-500/20 dark:text-pink-200 dark:ring-pink-500/40",
    icon: <InstagramIcon className="h-5 w-5" />,
  },
  {
    name: "X",
    followers: "32.4K",
    engagement: "2.9%",
    posts: 89,
    accentClassName: "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700",
    icon: <Twitter className="h-5 w-5" />,
  },
]

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange | undefined>()

  const stats = useMemo(
    () => computeStats({ from: range?.from, to: range?.to }),
    [range],
  )

  const periodLabel = useMemo(() => {
    if (stats.from && stats.to) {
      return `${format(stats.from, "MMM d, yyyy")} – ${format(stats.to, "MMM d, yyyy")}`
    }
    return undefined
  }, [stats])

  const intervals = useMemo<Interval[]>(() => {
    if (range?.from || range?.to) {
      return [
        {
          from: range?.from,
          to: range?.to ?? range?.from,
        },
      ]
    }
    if (stats.from || stats.to) {
      return [
        {
          from: stats.from,
          to: stats.to,
        },
      ]
    }
    return []
  }, [range, stats.from, stats.to])

  const rows = useMemo<Array<[string, string]>>(
    () => [
      ["Impressions", String(stats.impressions)],
      ["People reached", String(stats.reached)],
      ["Engagement rate", `${stats.engagementRate.toFixed(2)}%`],
    ],
    [stats],
  )

  const filenameBase = useMemo(() => {
    const fromPart = stats.from ? `-${format(stats.from, "yyyyMMdd")}` : ""
    const toPart = stats.to ? `-${format(stats.to, "yyyyMMdd")}` : ""
    return `key-metrics${fromPart}${toPart}`
  }, [stats.from, stats.to])

  const onExportCSV = useCallback(() => {
    const csv = buildCSV(rows, intervals)
    downloadBlob(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
      `${filenameBase}.csv`,
    )
  }, [rows, intervals, filenameBase])

  const onExportXLSX = useCallback(async () => {
    const blob = await buildXLSX(rows, intervals)
    downloadBlob(blob, `${filenameBase}.xlsx`)
  }, [rows, intervals, filenameBase])

  const onExportPDF = useCallback(async () => {
    const blob = await buildPDF("Key Metrics Report", rows, intervals)
    downloadBlob(blob, `${filenameBase}.pdf`)
  }, [rows, intervals, filenameBase])

  return (
    <main className="space-y-6">
      <Header />

      <FadeIn delay={0.14}>
        <section className="space-y-4">
          <DashboardKPI
            engagementRate={`${stats.engagementRate.toFixed(2)}%`}
            impressions={formatCompact(stats.impressions)}
            reached={formatCompact(stats.reached)}
            periodLabel={periodLabel}
            headerExtra={<DateRangePicker value={range} onChange={setRange} />}
            onExportCSV={onExportCSV}
            onExportXLSX={onExportXLSX}
            onExportPDF={onExportPDF}
          />
        </section>
      </FadeIn>

      <FadeIn delay={0.18}>
        <section>
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Publish or Schedule a Post</h2>
                <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">
                  Create compelling content, collaborate with teammates, and push it live when it performs best.
                </p>
              </div>
              <Link href="/composer" className="inline-flex w-full sm:w-auto">
                <Button
                  className="w-full gap-2 bg-[#2563eb] text-white transition-colors duration-200 hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb]"
                  aria-label="Create a new post"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      <section className="space-y-4 sm:space-y-6">
        <FadeIn delay={0.2}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Performance Metrics</h2>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:gap-6">
          {performanceMetrics.map((metric, index) => (
            <FadeIn key={metric.title} delay={0.1 * index + 0.22}>
              <Card {...metric} />
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="space-y-4 sm:space-y-6">
        <FadeIn delay={0.28}>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">Platform Overview</h2>
        </FadeIn>
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {platformOverview.map((platform, index) => (
            <FadeIn key={platform.name} delay={0.1 * index + 0.3}>
              <PlatformCard {...platform} />
            </FadeIn>
          ))}
        </div>
      </section>
    </main>
  )
}
