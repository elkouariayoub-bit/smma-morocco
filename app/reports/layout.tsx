import type { ReactNode } from 'react'

import { DashboardShell } from '@/components/dashboard-shell'

export default function ReportsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/reports">{children}</DashboardShell>
}
