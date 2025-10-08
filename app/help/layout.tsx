import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

export default function HelpLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/help">{children}</DashboardShell>
}
