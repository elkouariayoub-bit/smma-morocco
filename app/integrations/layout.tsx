import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

export default function IntegrationsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/integrations">{children}</DashboardShell>
}
