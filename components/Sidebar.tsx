'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { BarChart3, HelpCircle, Home, Megaphone, Plug, Server, Settings, Users } from 'lucide-react'

import type { Page } from '../types'
import { cn } from '@/lib/utils'

type SidebarProps = {
  /**
   * Support the legacy multi-page SPA shell by allowing callers to track the current page.
   * Next.js routes rely on the current pathname instead.
   */
  currentPage?: Page
  setCurrentPage?: (page: Page) => void
  /**
   * Triggered after a navigation interaction so mobile sheets can close when links are tapped.
   */
  onNavigate?: () => void
  /**
   * When rendered inside a sheet, shrink spacing so the menu feels comfortable on mobile.
   */
  variant?: 'desktop' | 'mobile'
}

export const sidebarNavItems: Array<{
  href: string
  label: string
  icon: typeof Home
  legacyPage?: Page
}> = [
  { href: '/dashboard', label: 'Home', icon: Home, legacyPage: 'composer' },
  { href: '/analytics', label: 'Analytics', icon: BarChart3, legacyPage: 'analytics' },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/deployments', label: 'Deployments', icon: Server },
  { href: '/integrations', label: 'Integrations', icon: Plug },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
]

export function Sidebar({ currentPage, setCurrentPage, onNavigate, variant = 'desktop' }: SidebarProps) {
  let pathname: string | undefined
  try {
    pathname = usePathname()
  } catch (error) {
    pathname = undefined
  }

  const handleNavigate = useCallback(
    (legacyPage?: Page) => {
      if (legacyPage && setCurrentPage) {
        setCurrentPage(legacyPage)
      }
      onNavigate?.()
    },
    [onNavigate, setCurrentPage],
  )

  return (
    <div
      className={cn(
        'flex h-full flex-col bg-white transition-colors dark:bg-gray-900',
        variant === 'desktop'
          ? 'w-64 border-r border-gray-200 shadow-sm transition dark:border-gray-800 lg:fixed lg:inset-y-0 lg:left-0'
          : 'w-full',
      )}
    >
      <div
        className={cn(
          'border-b border-gray-200 dark:border-gray-800',
          variant === 'mobile' ? 'px-4 py-5' : 'px-6 py-6',
        )}
      >
        <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
          SMMA
        </span>
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-50">Dashboard</span>
      </div>
      <nav className={cn('flex flex-1 flex-col gap-1.5 py-4', variant === 'mobile' ? 'px-4' : 'px-3')}
        aria-label="Primary"
      >
        {sidebarNavItems.map((item) => {
          const isActive = pathname === item.href || (!!currentPage && currentPage === item.legacyPage)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => handleNavigate(item.legacyPage)}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]',
                isActive
                  ? 'bg-[#2563eb]/10 text-[#2563eb] shadow-sm dark:bg-[#2563eb]/20'
                  : 'text-gray-600 hover:-translate-y-0.5 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100',
              )}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors duration-200',
                  isActive
                    ? 'text-[#2563eb]'
                    : 'text-gray-400 group-hover:text-gray-700 dark:text-gray-500 dark:group-hover:text-gray-300',
                )}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
