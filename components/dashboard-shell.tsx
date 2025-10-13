import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/lib/supabase"

export async function DashboardShell({
  children,
  redirectPath,
}: {
  children: ReactNode
  redirectPath: string
}) {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const hasCodeSession = cookies().get("code-auth")?.value === "true"

  if (!session && !hasCodeSession) {
    redirect(`/auth/login?next=${encodeURIComponent(redirectPath)}`)
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
