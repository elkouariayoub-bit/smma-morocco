"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { Sidebar, sidebarNavItems } from "@/components/Sidebar"
import { cn } from "@/lib/utils"

export function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 transition-colors dark:bg-gray-950">
      <aside className="hidden lg:block lg:w-64">
        <Sidebar variant="desktop" />
      </aside>

      <div className="flex w-full flex-1 flex-col">
        <MobileTopNav />

        <main className="flex-1">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">{children}</div>
        </main>
      </div>
    </div>
  )
}

function MobileTopNav() {
  const pathname = usePathname()

  return (
    <div className="border-b border-gray-200 bg-white transition-colors dark:border-gray-800 dark:bg-gray-900 lg:hidden">
      <div className="flex flex-col gap-3 px-4 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">SMMA</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-50">Dashboard</p>
        </div>
        <nav className="-mx-1 flex items-center gap-2 overflow-x-auto pb-1" aria-label="Mobile navigation">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]",
                  isActive
                    ? "bg-[#2563eb]/10 text-[#2563eb] dark:bg-[#2563eb]/20"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                )}
              >
                <item.icon
                  className={cn(
                    "h-4 w-4",
                    isActive
                      ? "text-[#2563eb]"
                      : "text-gray-400 transition-colors duration-200 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300",
                  )}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
