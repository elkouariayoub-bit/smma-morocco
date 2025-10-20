'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const items = [
  { href: '/settings', label: 'General', exact: true },
  { href: '/settings/profile', label: 'Profile' },
  { href: '/settings/billing', label: 'Billing' },
  { href: '/settings/plans', label: 'Plans' },
]

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 gap-6 p-4 md:grid-cols-[260px_1fr] md:p-6">
      {/* Left rail */}
      <aside className="rounded-xl border bg-card">
        <div className="p-4">
          <div className="mb-1 text-sm font-medium text-muted-foreground">Settings</div>
          <div className="text-xl font-semibold">Preferences</div>
        </div>
        <Separator />
        <ScrollArea className="h-[calc(100vh-14rem)]">
          <nav className="p-2">
            {items.map((it) => {
              const active = it.exact ? pathname === it.href : pathname.startsWith(it.href)
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted',
                    active ? 'bg-muted font-medium' : 'text-muted-foreground',
                  )}
                >
                  <span>{it.label}</span>
                  {it.label === 'Billing' && (
                    <Badge variant="secondary" className="text-[11px]">
                      Free plan
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Right content */}
      <section className="space-y-6">{children}</section>
    </div>
  )
}
