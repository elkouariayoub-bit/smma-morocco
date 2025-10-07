"use client"

import { LineChart } from "lucide-react"

import { Button } from "@/components/ui/button"

interface HeaderProps {
  name?: string
}

export function Header({ name }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm backdrop-blur lg:flex-row lg:items-center lg:justify-between dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">
          {name ? `Welcome back, ${name}` : "Welcome back"} 👋
        </h1>
        <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">Here’s a snapshot of your social performance</p>
      </div>
      <Button
        className="w-full gap-2 bg-[#2563eb] text-white transition-colors duration-200 hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb] sm:w-auto"
        aria-label="View analytics overview"
      >
        <LineChart className="h-4 w-4" />
        View Analytics
      </Button>
    </header>
  )
}
