import type { ReactNode } from "react"

import { Sidebar } from "@/components/nav/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <aside className="border-r bg-background">
        <Sidebar />
      </aside>
      <main className="p-6">{children}</main>
    </div>
  )
}
