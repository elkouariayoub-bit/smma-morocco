import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MetricCardProps {
  title: string
  value: string
  change: number
  description?: string
}

export function MetricCard({ title, value, change, description }: MetricCardProps) {
  const isPositive = change >= 0

  return (
    <Card className="relative overflow-hidden border-zinc-200 bg-white transition-colors duration-200 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#ff4081] via-[#ff4081]/70 to-[#ff4081]" aria-hidden="true" />
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-4 pt-4">
        <div>
          <p className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{value}</p>
          <span
            className={cn(
              "mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
              isPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
                : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
            )}
          >
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span className="sr-only">{isPositive ? "Increase" : "Decrease"}:</span>
            <span aria-hidden="true">{Math.abs(change).toFixed(1)}%</span>
          </span>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#ff4081]/40 bg-[#ff4081]/10 text-[#ff4081]">
          <span className="text-sm font-semibold">{title.slice(0, 2).toUpperCase()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
