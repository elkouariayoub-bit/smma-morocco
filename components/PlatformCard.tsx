import type { ReactNode } from "react"

import { Card as UiCard, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface PlatformCardProps {
  name: string
  icon: ReactNode
  followers: string
  engagement: string
  posts: number
  accentClassName?: string
}

export function PlatformCard({ name, icon, followers, engagement, posts, accentClassName }: PlatformCardProps) {
  return (
    <UiCard className="flex h-full flex-col rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <CardContent className="flex flex-1 flex-col gap-6 px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-600 ring-2 ring-transparent transition-colors dark:bg-gray-800 dark:text-gray-300",
                accentClassName,
              )}
            >
              {icon}
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 sm:text-base dark:text-gray-400">{name}</p>
              <p className="text-base font-semibold text-gray-900 sm:text-lg dark:text-gray-50">{followers} followers</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-500 sm:text-base dark:text-gray-400">
          <div className="flex flex-col gap-1">
            <span>Engagement rate</span>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-50">{engagement}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span>Posts</span>
            <span className="text-base font-semibold text-gray-900 dark:text-gray-50">{posts}</span>
          </div>
        </div>
      </CardContent>
    </UiCard>
  )
}
