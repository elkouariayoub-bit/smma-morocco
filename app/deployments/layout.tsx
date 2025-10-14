import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

export default function DeploymentsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/deployments">{children}</DashboardShell>
}
