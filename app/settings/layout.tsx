import type { ReactNode } from 'react'

import { DashboardShell } from '@/components/dashboard-shell'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/settings">{children}</DashboardShell>
}
