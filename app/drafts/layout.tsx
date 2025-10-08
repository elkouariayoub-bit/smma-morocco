import type { ReactNode } from "react"

import { DashboardShell } from "@/components/dashboard-shell"

export default function DraftsLayout({ children }: { children: ReactNode }) {
  return <DashboardShell redirectPath="/drafts">{children}</DashboardShell>
}
