import { Suspense } from "react"

import { DashboardShell } from "@/components/dashboard-shell"
import { ClientTable } from "@/components/clients/ClientTable"

export const metadata = {
  title: "Clients",
  description: "Manage client profiles, onboarding readiness, and campaign contacts in one place.",
}

export default function ClientsPage() {
  return (
    <DashboardShell redirectPath="/clients">
      <Suspense fallback={<div className="text-sm text-gray-400">Loading clients…</div>}>
        <ClientTable />
      </Suspense>
    </DashboardShell>
  )
}
