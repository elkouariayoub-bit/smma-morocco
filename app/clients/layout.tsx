import type { ReactNode } from 'react'

import { DashboardShell } from '@/components/dashboard-shell'
import { ClientsAuthBoundary } from '@/components/clients/ClientsAuthBoundary'

export default function ClientsLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell redirectPath="/clients">
      <ClientsAuthBoundary>{children}</ClientsAuthBoundary>
    </DashboardShell>
  )
}
