'use client'

import { useMemo } from 'react'
import { CalendarPlus, MessageSquarePlus, UserPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface QuickActionProps {
  onAction?: (action: string) => void
}

const ACTIONS = [
  {
    key: 'new-campaign',
    label: 'Launch new campaign',
    description: 'Spin up a paid campaign with preset targeting templates.',
    icon: CalendarPlus,
  },
  {
    key: 'invite-client',
    label: 'Invite a client',
    description: 'Share a secure invite to onboard a new brand partner.',
    icon: UserPlus,
  },
  {
    key: 'share-report',
    label: 'Share weekly report',
    description: 'Send the latest performance snapshot to stakeholders.',
    icon: MessageSquarePlus,
  },
]

export function QuickActions({ onAction }: QuickActionProps) {
  const actions = useMemo(() => ACTIONS, [])

  return (
    <div className="grid gap-4 md:grid-cols-3" role="region" aria-label="Quick actions">
      {actions.map((action) => (
        <div
          key={action.key}
          className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-[#ff4081] hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ff4081]/10 text-[#ff4081]">
              <action.icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{action.label}</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{action.description}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 w-full border-[#ff4081] text-[#ff4081] hover:bg-[#ff4081]/10 focus-visible:ring-[#ff4081]"
            onClick={() => onAction?.(action.key)}
          >
            Start
          </Button>
        </div>
      ))}
    </div>
  )
}
