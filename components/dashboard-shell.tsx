import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { DashboardLayout } from "@/components/dashboard-layout"

export async function DashboardShell({
  children,
  redirectPath,
}: {
  children: ReactNode
  redirectPath: string
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const hasCodeSession = cookieStore.get("code-auth")?.value === "true"

  if (!session && !hasCodeSession) {
    redirect(`/auth/login?next=${encodeURIComponent(redirectPath)}`)
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
