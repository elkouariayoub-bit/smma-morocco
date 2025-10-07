import type { ReactNode } from "react"
import Link from "next/link"

import { Sidebar } from "@/components/Sidebar"
import { Header } from "@/components/Header"
import { Card } from "@/components/Card"
import { PlatformCard } from "@/components/PlatformCard"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/fade-in"
import { KpiChart } from "@/components/KpiChart"
import {
  fetchAudienceGrowthSeries,
  fetchEngagementSeries,
  type KpiSeries,
} from "@/lib/kpi"
import {
  Users,
  Heart,
  Plus,
  TrendingUp,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter,
} from "lucide-react"

interface StatCard {
  title: string
  value: string
  description?: string
  growth?: string
  icon?: ReactNode
  trend?: KpiSeries
  trendLabel?: string
  showTrendAxis?: boolean
}

interface Platform {
  name: string
  followers: string
  engagement: string
  posts: number
  icon: ReactNode
  accentClassName?: string
}

const performanceMetrics: StatCard[] = [
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

export default async function DashboardPage() {
  const [audienceGrowthSeries, engagementSeries] = await Promise.all([
    fetchAudienceGrowthSeries(),
    fetchEngagementSeries(),
  ])

  const quickStats: StatCard[] = [
    {
      title: "Audience Growth",
      value: "+2.4K",
      growth: "↑ 5.2% vs last week",
      description: "New followers across all platforms",
      icon: <Users className="h-5 w-5" />,
      trendLabel: "Audience growth for the past 7 days",
      trend: audienceGrowthSeries,
    },
    {
      title: "Engagement",
      value: "+14.7K",
      growth: "↑ 3.9% vs last week",
      description: "Likes, comments, and shares",
      icon: <Heart className="h-5 w-5" />,
      trendLabel: "Engagement interactions for the past 7 days",
      trend: engagementSeries,
      showTrendAxis: false,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Hidden sidebar render keeps the component available for responsive layouts handled by the route shell. */}
      <div className="hidden">
        <Sidebar variant="desktop" />
      </div>

      <Header />

      <section className="grid gap-4 sm:grid-cols-2 lg:gap-6">
        {quickStats.map((card, index) => (
          <FadeIn key={card.title} delay={0.08 * index}>
            <Card {...card}>
              {card.trend ? (
                <div className="space-y-3 text-xs text-gray-500 dark:text-gray-400">
                  <p className="font-medium text-gray-400 dark:text-gray-500">Last 7 days</p>
                  <div className="h-24 text-[#2563eb] dark:text-[#93c5fd]">
                    <KpiChart
                      data={card.trend}
                      height={96}
                      showGrid
                      showAxis={card.showTrendAxis}
                      ariaLabel={card.trendLabel ?? `${card.title} trend`}
                    />
                  </div>
                </div>
              ) : null}
            </Card>
          </FadeIn>
        ))}
      </section>

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
    </div>
  )
}
