import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

export default function QueueLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/queue">{children}</DashboardShell>
}
