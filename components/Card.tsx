import type { ReactNode } from "react"

import { Card as UiCard } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface CardProps {
  title: string
  value: string | number
  description?: string
  icon?: ReactNode
  growth?: string
  children?: ReactNode
  className?: string
}

function isNegativeGrowth(growth?: string) {
  if (!growth) return false
  const normalized = growth.trim()
  if (!normalized) return false
  return /(^-|↓)/.test(normalized)
}

export function Card({
  title,
  value,
  description,
  icon,
  growth,
  children,
  className,
}: CardProps) {
  const hasGrowth = Boolean(growth)
  const hasDescription = Boolean(description)
  const growthIsNegative = isNegativeGrowth(growth)

  return (
    <UiCard
      className={cn(
        "group rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-500 sm:text-base dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl dark:text-gray-50">{value}</p>
        </div>
        {icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2563eb]/10 text-[#2563eb] dark:bg-[#2563eb]/20">
            {icon}
          </div>
        ) : null}
      </div>

      {hasGrowth || hasDescription ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
          {hasGrowth ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-colors",
                growthIsNegative
                  ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300"
                  : "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
              )}
            >
              {growth}
            </span>
          ) : null}
          {hasDescription ? (
            <span className="text-gray-500 dark:text-gray-400">{description}</span>
          ) : null}
        </div>
      ) : null}

      {children ? (
        <div className="mt-5 space-y-4 text-sm text-gray-500 dark:text-gray-400">{children}</div>
      ) : null}
    </UiCard>
  )
}
