import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

export default function DashboardRouteLayout({
  children,
}: {
  children: ReactNode
}) {
  return <DashboardShell redirectPath="/dashboard">{children}</DashboardShell>
}
