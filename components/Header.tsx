"use client"

import AlertsBell from "@/components/AlertsBell.client"

interface HeaderProps {
  name?: string
}

export function Header({ name }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 rounded-xl border border-gray-200 bg-white px-6 py-5 shadow-sm backdrop-blur dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">
            {name ? `Welcome back, ${name}` : "Welcome back"} 👋
          </h1>
          <p className="text-sm text-gray-500 sm:text-base dark:text-gray-400">Here’s a snapshot of your social performance</p>
        </div>
        <AlertsBell />
      </div>
    </header>
  )
}
