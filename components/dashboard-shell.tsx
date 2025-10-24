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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return <DashboardLayout>{children}</DashboardLayout>
  }

  const supabase = createServerComponentClient({ cookies })
  const response = await supabase.auth.getSession()
  const session = response.data.session
  const hasCodeSession = cookieStore.get("code-auth")?.value === "true"

  if (!session && !hasCodeSession) {
    redirect(`/login?next=${encodeURIComponent(redirectPath)}`)
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
