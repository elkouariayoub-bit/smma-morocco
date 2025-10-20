import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/analytics">{children}</DashboardShell>
}
