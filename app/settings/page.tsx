import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

import { getOrCreateUserSettings } from '@/lib/settings'
import type { SettingsView } from '@/lib/settings-shared'
import { SettingsClient } from './settings-client'

export const metadata = {
  title: 'Settings',
  description: 'Manage your SMMA profile, platform integrations, and workspace preferences in one place.',
}

export default async function SettingsPage() {
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const user = session?.user
  let settings: SettingsView | null = null

  if (user?.id) {
    settings = await getOrCreateUserSettings(user.id, {
      email: user.email,
      fullName: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : undefined,
      role: typeof user.user_metadata?.role === 'string' ? user.user_metadata.role : undefined,
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#9ca3af]">Account</p>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50">
          Workspace settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Configure your profile, API credentials, and preferences to keep your SMMA operations running smoothly.
        </p>
      </header>

      {settings ? (
        <SettingsClient initialSettings={settings} />
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          Unable to load settings for this account.
        </div>
      )}
    </div>
  )
}
